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
  series_site_id: string | undefined;
  corner_site_id: string | undefined;
  url: string | undefined;
}

type SeriesTransferType = {
  corner_name: string;
  id: number;
  onair_date: string;
  title: string;
  thumbnail_url: string;
  series_site_id: string;
  corner_site_id: string;
  url: string | undefined;
}

type SeriesListResponseType = {
  series: SeriesResponseType[];
};

type CornersListResponseType = {
  corners?: SeriesTransferType[];
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

const hasCorners = ({ corner_site_id }: { corner_site_id: string }) => corner_site_id == "";

const getSiteUrl = ({ url, series_site_id, corner_site_id }: { url: string | undefined, series_site_id: string, corner_site_id: string }) => {
  if (url) return url;
  return hasCorners({ corner_site_id }) ? `https://www.nhk.or.jp/radio/ondemand/corners.html?p=${series_site_id}` :
    `https://www.nhk.or.jp/radio/ondemand/detail.html?p=${series_site_id}_${corner_site_id}`;
};

const getDetailUrl = ({ series_site_id, corner_site_id }: { series_site_id: string, corner_site_id: string }) => {
  return `https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?site_id=${series_site_id}&corner_site_id=${corner_site_id}`
}

export const getShowList = async (): Promise<Show[]> => {
  const result: Show[] = [];
  const genreListRes = await getGenreList();
  for (const genre of genreListRes.genres) {
    const seriesListRes = await getSeriesList(genre.genre);
    // console.log(JSON.stringify(seriesListRes, null, 2));
    for (const series of seriesListRes.series) {
      if (!series.series_site_id) {
        if (series.url) {
          continue;
        }
        series.series_site_id = series.url?.split("/").pop();
      }
      if (!series.corner_site_id) {
        series.corner_site_id = "01"
      }

      const seriesTransfer = series as SeriesTransferType;
      if (hasCorners(seriesTransfer)) {
        const cornersListRes = await getSeriesCornersList(seriesTransfer.series_site_id);
        for (const corner of cornersListRes.corners ?? []) {
          const exists = result.find(({ id }) => id === corner.id.toString());
          if (exists) {
            exists.genre = exists.genre.concat(",", genre.name);
          } else {
            result.push({
              id: corner.id.toString(),
              name: corner.title,
              corderName: corner.corner_name,
              genre: genre.name,
              detailUrl: getDetailUrl({ series_site_id: seriesTransfer.series_site_id, corner_site_id: corner.corner_site_id }),
              thumbnailUrl: corner.thumbnail_url,
              onAirDate: corner.onair_date,
              siteUrl: getSiteUrl(corner),
            });
          }
        }
      } else {
        const exists = result.find(({ id }) => id === series.id.toString());
        if (exists) {
          exists.genre = exists.genre.concat(",", genre.name);
        } else {
          result.push({
            id: series.id.toString(),
            name: series.title,
            genre: genre.name,
            detailUrl: getDetailUrl({ series_site_id: seriesTransfer.series_site_id, corner_site_id: seriesTransfer.corner_site_id }),
            thumbnailUrl: series.thumbnail_url,
            onAirDate: series.onair_date,
            siteUrl: getSiteUrl(seriesTransfer),
          });
        }
      }
    }
    await sleep(sleepTime);
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
