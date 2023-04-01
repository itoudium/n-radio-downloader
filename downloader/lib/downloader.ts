import axios from 'axios'
import fs from 'fs/promises'
import crypto from 'crypto'
import { AACBuilder } from './audio'
import path from "path"

const client = axios;

// timer function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DownloadOptions {
  // the directory to save the downloaded files
  outputDir: string
  fileName: string
  progressFn?: (progress: number) => void
}

export const downloadByM3U8 = async (url: string, options: DownloadOptions) => {
  const { data } = await client.get<string>(url, {
    responseType: 'text'
  })
  const nextUrl = data.split('\n').filter(x => x.match('m3u8'))[0]
  if (!nextUrl) {
    console.warn('invalid m3u8 file')
    return null
  }
  const nextUrlAbs = new URL(nextUrl, url).href
  const { data: nextData } = await client.get<string>(nextUrlAbs, { responseType: 'text' })
  const urls = nextData.split('\n').filter(x => !x.startsWith('#') && x.match('aac')).map(x => new URL(x, url).href)
  const keyRow = nextData.split('\n').find(x => x.startsWith('#EXT-X-KEY'))
  const mediaSequenceRow = nextData.split('\n').find(x => x.startsWith('#EXT-X-MEDIA-SEQUENCE'))
  if (!mediaSequenceRow) throw new Error('no media sequence found')
  const mediaSequence = parseInt(mediaSequenceRow.split(':')[1])

  if (!keyRow) throw new Error('no key found')

  const keyUrl = extractKeyUrl(keyRow)
  if (!keyUrl) throw new Error('invalid key row')

  const { data: key } = await client.get<Buffer>(keyUrl, { responseType: 'arraybuffer' })

  const aac = new AACBuilder(path.join(options.outputDir, `${options.fileName}.aac`))

  let progress = 0;
  for (const url of urls) {
    const { data } = await client.get<Buffer>(url, { responseType: 'arraybuffer' })
    const decrypted = decryptBuffer(data, key, mediaSequence)
    aac.addChunk(decrypted);
    progress ++;
    if (options.progressFn) options.progressFn(progress / urls.length);
    await sleep(100);
  }
  await aac.finalize()
}

// extract url from string that looks like `#EXT-X-KEY:METHOD=AES-128,URI="${url}"`
const extractKeyUrl = (keyRow: string): string | null => {
  const url = keyRow.match(/URI="(.*?)"/)
  return (url != null) ? url[1] : null
}

const decryptBuffer = (data: Buffer, key: Buffer, mediaSequence: number): Buffer => {
  // convert mediaSequence to 16 byte BigEndian Buffer
  const iv = Buffer.from(mediaSequence.toString(16).padStart(32, '0'), 'hex')

  // decrypt data by key with AES-128
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  return Buffer.concat([decipher.update(data), decipher.final()])
}

export const decryptoFile = async (inputPath: string, outputPath: string, keyPath: string) => {
  const key = (await fs.readFile(keyPath))
  const data = await fs.readFile(inputPath)


  const mediaSequence = 1
  const iv = Buffer.alloc(16)
  iv[15] = mediaSequence

  // decrypt data by key with AES-128
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])

  await fs.writeFile(outputPath, decrypted)
}
