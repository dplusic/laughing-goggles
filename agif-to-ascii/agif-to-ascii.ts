import asciify from "asciify-image";
import gifFrames from "gif-frames";
import * as fs from "fs";
import * as tempy from "tempy";

type Size = { width: number; height: number };

const veryBigLengthToIgnore = 1000 * 1000;
const defaultOutputSize: Size = {
  width: 16,
  height: 12
};

export const normalizeSize = ({ width, height }: Partial<Size>) => {
  return width && height
    ? { width, height }
    : width
    ? {
        width,
        height: veryBigLengthToIgnore
      }
    : height
    ? {
        width: veryBigLengthToIgnore,
        height
      }
    : defaultOutputSize;
};

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

type AsciiFrameData = string;

type AsciiFrame = {
  data: AsciiFrameData;
  delayMs: number;
};

type AsciiImage = Size & {
  frames: AsciiFrame[];
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
): Promise<AsciiFrameData> =>
  asciify(imageFile, {
    fit: "box",
    color: true,
    ...size
  });

export const toAsciiImage = async (
  inputPath: string,
  maybeOutputSize: Partial<Size> = defaultOutputSize
): Promise<AsciiImage> => {
  const outputSize = normalizeSize(maybeOutputSize);
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
  type IndexedAsciiFrame = AsciiFrame & { index: number };
  const promises = frameData.map(
    (frame, index) =>
      new Promise<IndexedAsciiFrame>(async (resolve, reject) => {
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
            delayMs: frame.frameInfo.delay * 10
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
      .sort((a: IndexedAsciiFrame, b: IndexedAsciiFrame) => a.index - b.index)
      .map<AsciiFrame>((each: IndexedAsciiFrame) => ({
        data: each.data,
        delayMs: each.delayMs
      }))
  };
};
