import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import * as got from "got";
import * as tempy from "tempy";
import * as fs from "fs";
import agifToAscii from "./agif-to-ascii";

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

export const convert: APIGatewayProxyHandler = async (event, _context) => {
  const tempFile = tempy.file({ extension: "git" });

  const { url, height } = event.queryStringParameters;
  const cacheKey = url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  console.log(`Check cacheKey`, cacheKey);

  try {
    if (!(await s3Exists(cacheKey))) {
      console.log(`Convert to`, url);
      await new Promise<void>(resolve =>
        got
          .stream(url)
          .pipe(fs.createWriteStream(tempFile))
          .on("finish", resolve)
      );
      const ascii = await agifToAscii(tempFile, {
        width: 1000 * 1000, // very big
        height: +height
      });
      await s3
        .putObject({
          Bucket: bucketName,
          Key: cacheKey,
          Body: Buffer.from(JSON.stringify(ascii), "utf-8")
        })
        .promise();
      console.log(`Upload to `, cacheKey);
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
