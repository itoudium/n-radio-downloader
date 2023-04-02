import axios from 'axios'
import { type Show, type ShowDetailType } from './types'

interface ProgramListResponse {
  genre_list: GenreType[]
}

interface GenreType {
  // name of genere
  genre: string
  // programs of genere
  data_list: ProgramType[]
}

interface ProgramType {
  // url of detail json
  detail_json: string // "https://www.nhk.or.jp/radioondemand/json/0442/bangumi_0442_01.json"
  media_code: string
  // onAir date by human readable string
  onair_date: string
  open_time: string
  program_name: string
  program_name_kana: string
  site_id: string
  corner_id: string
  start_time: string
  // thumbnail image url
  thumbnail_p: string
  update_time: string
}

const PROGRAM_LIST_URL = 'https://www.nhk.or.jp/radioondemand/json/index_v3/index_genre.json'

export const getShowList = async (): Promise<Show[]> => {
  const { data } = await axios.get<ProgramListResponse>(PROGRAM_LIST_URL)
  return data.genre_list.flatMap(genre => {
    return genre.data_list.map(program => {
      return ({
        id: `${program.site_id}_${program.corner_id}`,
        name: program.program_name,
        genre: genre.genre,
        detailUrl: program.detail_json,
        thumbnailUrl: program.thumbnail_p,
        onAirDate: program.onair_date
      })
    })
  })
}

interface ShowDetailResponse {
  main: {
    program_name: string
    schedule: string
    site_detail: string
    detail_list: Array<{
      file_list: Array<{
        file_title: string
        file_title_sub: string
        onair_date: string
        open_time: string
        close_time: string
        file_id: string
        // url of the m3u8 file
        file_name: string
      }>
      headline_id: string
    }>
  }
}

export const getShowDetail = async (detailUrl: string): Promise<ShowDetailType> => {
  const { data } = await axios.get<ShowDetailResponse>(detailUrl)
  return {
    name: data.main.program_name,
    detail: data.main.site_detail,
    schedule: data.main.schedule,
    episodes: data.main.detail_list.flatMap(detail => {
      return detail.file_list.splice(0, 1).map(file => {
        return {
          id: detail.headline_id,
          title: file.file_title,
          onAirDate: file.onair_date,
          url: file.file_name
        }
      })
    })
  }
}
