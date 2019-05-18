import { APIGatewayProxyHandler } from "aws-lambda";
import * as got from "got";
import * as tempy from "tempy";
import * as fs from "fs";
import agifToAscii from "./agif-to-ascii";

import "source-map-support/register";

export const convert: APIGatewayProxyHandler = async (event, _context) => {
  const tempFile = tempy.file({ extension: "git" });

  const { url, height } = event.queryStringParameters;
  console.log(`Convert to`, url);

  try {
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
    return {
      statusCode: 200,
      body: JSON.stringify(ascii)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: error.message
    };
  }
};
