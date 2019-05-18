export type AsciiGif = {
  width: number;
  height: number;
  frames: {
    data: [string, string][][];
    delayMs: number;
  }[];
};

const baseUrl = `https://ag2a.yyt.life`;
