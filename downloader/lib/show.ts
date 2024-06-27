import axios from "axios";
import { type Show, type ShowDetailType } from "./types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const sleepTime = 500;

interface GenreType {
  // name of genere
  genre: string;
  // programs of genere
  data_list: ProgramType[];
}

interface ProgramType {
  // url of detail json
  detail_json: string; // "https://www.nhk.or.jp/radioondemand/json/0442/bangumi_0442_01.json"
  media_code: string;
  // onAir date by human readable string
  onair_date: string;
  open_time: string;
  program_name: string;
  program_name_kana: string;
  site_id: string;
  corner_id: string;
  corner_name: string;
  start_time: string;
  // thumbnail image url
  thumbnail_p: string;
  update_time: string;
}

type GenresResponseType = {
  genres: {
    genre: string;
    name: string;
  }[];
};

type SeriesResponseType = {
  corner_name: string;
  id: number;
  onair_date: string;
  title: string;
  thumbnail_url: string;
  series_site_id: string;
  corner_site_id: string;
}

type SeriesListResponseType = {
  series: SeriesResponseType[];
};

type CornersListResponseType = {
  corners?: SeriesResponseType[];
}

async function getGenreList() {
  const { data } = await axios.get<GenresResponseType>(
    "https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series/genres"
  );

  return data
}

const SERIES_LIST_URL =
  "https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?genre=";
const getSeriesListUrl = (genre: string) => `${SERIES_LIST_URL}${genre}`;

async function getSeriesList(genre: string) {
  const { data } = await axios.get<SeriesListResponseType>(
    getSeriesListUrl(genre)
  );

  return data
}

async function getSeriesCornersList(series_site_id: string) {
  const { data } = await axios.get<CornersListResponseType>(
    `https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?site_id=${series_site_id}`
  );

  return data
}

const hasCorners = ({corner_site_id}: {corner_site_id: string}) => corner_site_id == "";

const getSiteUrl = ({series_site_id, corner_site_id}: {series_site_id: string, corner_site_id: string}) => {
  return hasCorners({corner_site_id}) ? `https://www.nhk.or.jp/radio/ondemand/corners.html?p=${series_site_id}` :
    `https://www.nhk.or.jp/radio/ondemand/detail.html?p=${series_site_id}_${corner_site_id}`;
};

const getDetailUrl = ({series_site_id, corner_site_id}: {series_site_id: string, corner_site_id: string}) => {
  return `https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?site_id=${series_site_id}&corner_site_id=${corner_site_id}`
}

export const getShowList = async (): Promise<Show[]> => {
  const result: Show[] = [];
  const genreListRes = await getGenreList();
  for (const genre of genreListRes.genres) {
    const seriesListRes = await getSeriesList(genre.genre);
    for (const series of seriesListRes.series) {
      if (hasCorners(series)) {
        const cornersListRes = await getSeriesCornersList(series.series_site_id);
        for (const corner of cornersListRes.corners ?? []) {
          result.push({
            id: corner.id.toString(),
            name: corner.title,
            genre: genre.name,
            detailUrl: getDetailUrl({series_site_id: series.series_site_id, corner_site_id: corner.corner_site_id}),
            thumbnailUrl: corner.thumbnail_url,
            onAirDate: corner.onair_date,
            siteUrl: getSiteUrl(corner),
          });
        }
      } else {
        result.push({
          id: series.id.toString(),
          name: series.title,
          genre: genre.name,
          detailUrl: getDetailUrl({series_site_id: series.series_site_id, corner_site_id: series.corner_site_id}),
          thumbnailUrl: series.thumbnail_url,
          onAirDate: series.onair_date,
          siteUrl: getSiteUrl(series),
        });
      }
      await sleep(sleepTime);
    }
  }

  return result;
};

interface ShowDetailResponse {
  episodes: {
    id: number,
    program_title: string,
    program_sub_title: string,
    stream_url: string,
    onair_date: string,
  }[];
  title: string,
  schedule: string,
  series_description: string,
}

export const getShowDetail = async (
  detailUrl: string
): Promise<ShowDetailType> => {
  const { data } = await axios.get<ShowDetailResponse>(detailUrl);
  console.log(data);
  return {
    name: data.title,
    detail: data.series_description,
    schedule: data.schedule,
    episodes: data.episodes.map(episode => ({
      id: episode.id.toString(),
      title: episode.program_title,
      onAirDate: episode.onair_date,
      url: episode.stream_url,
    })),
  };
};
