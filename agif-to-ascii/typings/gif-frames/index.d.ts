// Tough typings only for me :$
declare module "gif-frames" {
  type GifFrameInput = {
    url: string;
    frames: number | "all";
    outputType: "jpg" | "png";
    cumulative: boolean;
  };

  type GifFrameInfo = {
    x: number;
    y: number;
    width: number;
    height: number;
    delay: number;
  };

  type GifFrame = {
    getImage: () => NodeJS.ReadableStream;
    frameInfo: GifFrameInfo;
  };

  function gifFrames(args: GifFrameInput): Promise<GifFrame[]>;
  export = gifFrames;
}
