type GifItem = {
  kind: string;
  type: string;
  id: string;
  slug: string;
  url: string;
  createdAt: string;
};

const baseUrl = "https://gdg-webtech-hackathon-backend.firebaseapp.com/api/gif";

type ApiResponse<T> = {
  data: T;
};

type GifItems = { data: GifItem[] };
export const fetchRandom50 = (): Promise<ApiResponse<GifItems>> =>
  fetch(`${baseUrl}/random50`).then(r => r.json());

export const getItem = (id: string): Promise<ApiResponse<GifItem>> =>
  fetch(`${baseUrl}/${id}`).then(r => r.json());

export const listAll = (page: number): Promise<ApiResponse<GifItems>> =>
  fetch(`${baseUrl}/all`).then(r => r.json());

export const search = (q: string): Promise<ApiResponse<GifItems>> =>
  fetch(`${baseUrl}/search?q=` + encodeURIComponent(q)).then(r => r.json());
