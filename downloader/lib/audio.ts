/* eslint-disable no-tabs */
import fs from 'fs/promises'
import EventEmitter from 'events'

export const parseAACFile = async (path: string) => {
  const buffer = await fs.readFile(path)
  parseAAC(buffer)
}

export const parseAAC = (data: Buffer) => {
  seekFlame(data, 0)
}

type Metadata = {
  title?: string;
  album?: string;
}
export class AACBuilder {
  queue: Buffer[] = []
  finish = false
  initialized = false;
  isProcessing = false;
  outputPath: string
  tempPath: string
  event = new EventEmitter()

  constructor(outputPath: string, metadata?: Metadata) {
    this.outputPath = outputPath
    this.tempPath = outputPath + '.temp'
  }

  // add chunk to queue
  addChunk(chunk: Buffer) {
    this.queue.push(chunk)
    if (!this.isProcessing) {
      setImmediate(() => this.processQueue())
    }
  }

  async initializeFile() {
    await fs.rm(this.tempPath, { force: true })
    await fs.rm(this.outputPath, { force: true })
    this.initialized = true;
  }

  async processQueue() {

    if (this.queue.length === 0 && this.finish) {
      this.event.emit("finish");
      this.isProcessing = false;
      return;
    }

    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    const buffer = this.queue.shift()
    if (!this.initialized) {
      await this.initializeFile();
    }
    if (buffer != null) {
      const flames = seekFlame(buffer, 0)
      for (const flame of flames) {
        const dest = Buffer.alloc(flame.length)
        buffer.copy(dest, 0, flame.offset, flame.offset + flame.length)
        await fs.appendFile(this.tempPath, dest)
      }
    }
    setImmediate(() => this.processQueue());
  }

  async finalize(): Promise<void> {
    this.finish = true

    if (this.isProcessing) {
      await new Promise((resolve) => {
        this.event.once("finish", resolve);
      })
    }
    await fs.rename(this.tempPath, this.outputPath)
  }
}

/* AAC file flame format

from: https://wiki.multimedia.cx/index.php/ADTS
AAAAAAAA AAAABCCD EEFFFFGH HHIJKLMM MMMMMMMM MMMOOOOO OOOOOOPP (QQQQQQQQ QQQQQQQQ)

Letter	Length (bits)	Description
A	12	Syncword, all bits must be set to 1.
B	1	MPEG Version, set to 0 for MPEG-4 and 1 for MPEG-2.
C	2	Layer, always set to 0.
D	1	Protection absence, set to 1 if there is no CRC and 0 if there is CRC.
E	2	Profile, the MPEG-4 Audio Object Type minus 1.
F	4	MPEG-4 Sampling Frequency Index (15 is forbidden).
G	1	Private bit, guaranteed never to be used by MPEG, set to 0 when encoding, ignore when decoding.
H	3	MPEG-4 Channel Configuration (in the case of 0, the channel configuration is sent via an inband PCE (Program Config Element)).
I	1	Originality, set to 1 to signal originality of the audio and 0 otherwise.
J	1	Home, set to 1 to signal home usage of the audio and 0 otherwise.
K	1	Copyright ID bit, the next bit of a centrally registered copyright identifier. This is transmitted by sliding over the bit-string in LSB-first order and putting the current bit value in this field and wrapping to start if reached end (circular buffer).
L	1	Copyright ID start, signals that this frame's Copyright ID bit is the first one by setting 1 and 0 otherwise.
M	13	Frame length, length of the ADTS frame including headers and CRC check.
O	11	Buffer fullness, states the bit-reservoir per frame.
*/

interface FlameType {
  id: number
  offset: number
  length: number
}

const seekFlame = (data: Buffer, offset: number): FlameType[] => {
  const flameMap: FlameType[] = []

  while (true) {
    if (data[offset] === 0xff && (data[offset + 1] & 0xF0) === 0xF0 && (data[offset + 1] & 0x06) === 0x00) {
      const flameLength = ((data[offset + 3] & 0x03) << 11) + ((data[offset + 4] & 0xFF) << 3) + ((data[offset + 5] & 0xE0) >> 5)
      flameMap.push({
        id: flameMap.length,
        offset,
        length: flameLength
      })
      offset += flameLength
    } else {
      offset += 1
    }
    if (data.byteLength < offset) {
      break
    }
  }
  return flameMap
}
