
export interface Show {
  id: string
  name: string
  corderName?: string
  genre: string
  detailUrl: string
  thumbnailUrl: string
  onAirDate: string
  siteUrl: string
}

export interface ShowDetailType {
  name: string
  detail: string
  schedule: string
  episodes: Episode[]
}

export interface Episode {
  id: string;
  title: string;
  onAirDate: string;
  // the m3u8 file url
  url: string
}
