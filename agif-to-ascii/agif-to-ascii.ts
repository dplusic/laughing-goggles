import asciify from "asciify-image";
import gifFrames from "gif-frames";
import * as fs from "fs";
import * as tempy from "tempy";

const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

type Size = { width: number; height: number };

const resizeWithRatio = (inputSize: Size, refSize: Size): Size => {
  const widthRatio = refSize.width / inputSize.width;
  const heightRatio = refSize.height / inputSize.height;
  return widthRatio < heightRatio
    ? {
        width: refSize.width,
        height: Math.floor(widthRatio * inputSize.height)
      }
    : {
        height: refSize.height,
        width: Math.floor(heightRatio * inputSize.width)
      };
};

type AsciiValue = [string /* char */, string /* rgb hex */];
type AsciiFrameData = AsciiValue /* col */[] /* row */[];

type AsciiFrame = {
  data: AsciiFrameData;
  delayMs: number;
};

type AsciiImage = Size & {
  frames: AsciiFrame[];
};

const defaultOutputSize: Size = {
  width: 40,
  height: 30
};

const writeImageToTempFile = (
  input: NodeJS.ReadableStream,
  extension: string = "png"
) =>
  new Promise<string>(resolve => {
    const tempFile = tempy.file({ extension });
    return input
      .pipe(fs.createWriteStream(tempFile))
      .on("finish", () => resolve(tempFile));
  });

const convertAsciiFrames = async (
  imageFile: string,
  size: Size
): Promise<AsciiFrameData> => {
  const asciified = await asciify(imageFile, {
    fit: "box",
    color: true,
    format: "rgb",
    ...size
  });
  return asciified.map(line =>
    line.map<AsciiValue>(tuple => {
      return [tuple.v, rgbToHex(tuple)];
    })
  );
};

const toAsciiImage = async (
  inputPath: string,
  outputSize: Size = defaultOutputSize
): Promise<AsciiImage> => {
  const frameData = await gifFrames({
    url: inputPath,
    frames: "all",
    outputType: "png",
    cumulative: true
  });
  if (!frameData || !frameData[0].frameInfo) {
    throw new Error("No frame data from " + inputPath);
  }
  const asciiSize: Size = resizeWithRatio(frameData[0].frameInfo, outputSize);
  const promises = frameData.map(
    (frame, index) =>
      new Promise<AsciiFrame & { index: number }>(async (resolve, reject) => {
        try {
          const outputFile = await writeImageToTempFile(
            frame.getImage(),
            "png"
          );
          const data = await convertAsciiFrames(outputFile, asciiSize);
          fs.unlinkSync(outputFile);
          resolve({
            index,
            data,
            delayMs: frame.frameInfo.delay / 10
          });
        } catch (error) {
          reject(error);
        }
      })
  );
  const frames = await Promise.all(promises);
  return {
    width: asciiSize.width,
    height: asciiSize.height,
    frames: frames
      .sort((a, b) => a.index - b.index)
      .map<AsciiFrame>(each => ({ data: each.data, delayMs: each.delayMs }))
  };
};

export default toAsciiImage;
