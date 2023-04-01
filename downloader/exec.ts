// sample execution driver
import { downloadByM3U8 } from './lib/downloader'
import { getShowDetail, getShowList } from './lib/show'

getShowList().then(shows => {
  console.log(shows)
  const show = shows.find(x => x.name === 'ラジオ英会話')
  if (show != null) {
    getShowDetail(show.detailUrl).then(showDetail => {
      showDetail.episodes.map(episode => {
        downloadByM3U8(episode.url, { outputDir: './out', fileName: `${show.name} - ${episode.title}` }).then(x => { console.log('finish') })
      })
    })
  }
})

