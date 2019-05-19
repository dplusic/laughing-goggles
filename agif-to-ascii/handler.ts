import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import * as got from "got";
import * as lzutf8 from "lzutf8";
import * as tempy from "tempy";
import * as fs from "fs";
import * as ag2a from "./agif-to-ascii";

import "source-map-support/register";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
};

const bucketName = process.env.CACHE_BUCKET;
const s3 = new S3();

const s3Exists = (key: string) =>
  new Promise<boolean>(resolve =>
    s3
      .headObject({
        Bucket: bucketName,
        Key: key
      })
      .promise()
      .then(() => resolve(true))
      .catch(() => resolve(false))
  );

const downloadGifFromUrl = (url: string) =>
  new Promise<string>((resolve, reject) => {
    const tempFile = tempy.file({ extension: "gif" });
    return got
      .stream(url)
      .on("error", reject)
      .pipe(fs.createWriteStream(tempFile))
      .on("error", reject)
      .on("finish", () => resolve(tempFile));
  });

export const convert: APIGatewayProxyHandler = async (event, _context) => {
  const { url, width, height } = event.queryStringParameters;

  const preferredSize = ag2a.normalizeSize({
    width: +(width || "0"),
    height: +(height || "0")
  });
  console.log(`preferredSize`, preferredSize);

  const cacheKey = [
    url.replace(/[^a-z0-9]/gi, "_").toLowerCase(),
    preferredSize.width,
    preferredSize.height
  ].join("_");
  console.log(`Check cacheKey`, cacheKey);

  try {
    if (!(await s3Exists(cacheKey))) {
      console.log(`Convert to`, url);

      const tempFile = await downloadGifFromUrl(url);
      const ascii = await ag2a.toAsciiImage(tempFile);
      fs.unlinkSync(tempFile);

      const content: string = lzutf8.compress(JSON.stringify(ascii), {
        outputEncoding: "BinaryString"
      });
      const bodyBuffer = Buffer.from(content, "utf-8");
      await s3
        .putObject({
          Bucket: bucketName,
          Key: cacheKey,
          Body: bodyBuffer
        })
        .promise();
      console.log(`Upload to `, cacheKey, content.length, bodyBuffer.length);
    }

    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: cacheKey,
      Expires: 600
    });
    console.log(`signedUrl`, signedUrl);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        url: signedUrl
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: error.message
    };
  }
};

if (require.main === module) {
  const [url, width, height] = process.argv.slice(2);
  (async () => {
    try {
      console.log(url);
      const tempFile = await downloadGifFromUrl(url);
      const ascii = await ag2a.toAsciiImage(
        url,
        ag2a.normalizeSize({
          width: +(width || "0"),
          height: +(height || "0")
        })
      );
      fs.unlinkSync(tempFile);

      const json = JSON.stringify(ascii);
      const encoded: string = lzutf8.compress(json, {
        outputEncoding: "BinaryString"
      });
      const decoded: string = lzutf8.decompress(encoded, {
        inputEncoding: "BinaryString"
      });
      console.log(
        `json.length`,
        json.length,
        `encoded.length`,
        encoded.length,
        `decoded.length`,
        decoded.length
      );
    } catch (error) {
      console.error(error);
    }
  })();
}
