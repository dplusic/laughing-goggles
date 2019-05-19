import * as lzutf8 from "lzutf8";

export type AsciiGif = {
  width: number;
  height: number;
  frames: {
    data: [string, string][][];
    delayMs: number;
  }[];
};

type AsciiUrl = {
  url: string;
};

const baseUrl: string = process.env.REACT_APP_AG2A_SERVER_URL!;

export const toAsciiData = async (
  url: string,
  maybeSize?: { width?: number; height?: number }
): Promise<AsciiGif | undefined> => {
  const size =
    maybeSize && (maybeSize.width || maybeSize.height)
      ? maybeSize
      : { width: 28, height: undefined };
  try {
    const uploadResult: AsciiUrl = await fetch(
      `${baseUrl}/?${[
        `url=` + encodeURIComponent(url),
        size && size.width ? `width=${size.width}` : undefined,
        size && size.height ? `height=${size.height}` : undefined
      ]
        .filter(Boolean)
        .join("&")}`
    ).then(r => r.json());
    if (!uploadResult || !uploadResult.url) {
      return undefined;
    }
    const encoded = await fetch(uploadResult.url).then(r => r.text());
    const ascii: AsciiGif = JSON.parse(
      lzutf8.decompress(encoded, { inputEncoding: "BinaryString" })
    );
    if (
      !ascii.width ||
      !ascii.height ||
      !ascii.frames ||
      ascii.frames.length === 0
    ) {
      return undefined;
    }
    return ascii;
  } catch (error) {
    console.warn(`Cannot asciify`, error);
    return undefined;
  }
};

export const urlsToAsciiData = (outputSize: {
  width?: number;
  height?: number;
}) => (urls: string[]) =>
  Promise.all(
    urls.map((gifUrl: string) => toAsciiData(gifUrl, outputSize))
  ).then(maybeResults => maybeResults.filter(Boolean).map(each => each!));
