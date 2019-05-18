export type AsciiGif = {
  width: number;
  height: number;
  frames: {
    data: [string, string][][];
    delayMs: number;
  }[];
};

const baseUrl = `https://ag2a.yyt.life`;
const ag2a = (url: string, height: number = 30) =>
  fetch(`${baseUrl}/?url=${encodeURIComponent(url)}&height=${height}`).then(r =>
    r.json()
  );

export default ag2a;
