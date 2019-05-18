export type AsciiGif = {
  width: number;
  height: number;
  frames: {
    data: [string, string][][];
    delayMs: number;
  }[];
};

const baseUrl: string = process.env.REACT_APP_AG2A_SERVER_URL!;
const ag2a = (url: string, size?: { width?: number; height?: number }) =>
  fetch(
    `${baseUrl}/?${[
      `url=` + encodeURIComponent(url),
      size && size.width ? `width=${size.width}` : undefined,
      size && size.height ? `height=${size.height}` : undefined
    ]
      .filter(Boolean)
      .join("&")}`
  ).then(r => r.json());

export default ag2a;
