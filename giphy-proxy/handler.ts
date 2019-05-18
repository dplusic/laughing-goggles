import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import * as giphy from "giphy-api";
import { parse as URLParse } from "url";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
};

const g = giphy(process.env.API_KEY);

type GifItem = {
  kind: string;
  type: string;
  id: string;
  slug: string;
  url: string;
  createdAt: string;
};

const toMediaURL = (inputUrl: string) =>
  inputUrl
    ? `https://i.giphy.com` + URLParse(inputUrl).path.replace("_s.gif", ".gif")
    : "";

const translateResponse = (item: giphy.GIFObject): GifItem => ({
  id: item.id,
  type: item.type,
  slug: item.slug,
  kind: item.title,
  createdAt: item.create_datetime,
  url: toMediaURL(
    Object.entries(item.images)
      .map(([_, image]) => ({ height: image.height, url: image.url }))
      .filter(each => !!each.height && !!each.url && each.height >= 200)
      .sort((a, b) => a.height - b.height)[0].url
  )
});

export const fetchRandom50: APIGatewayProxyHandler = async () => {
  const result = await g.trending();
  console.log(result);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      data: result.data.map(translateResponse).filter(each => each.url)
    })
  };
};

export const getItem: APIGatewayProxyHandler = async event => {
  const { id } = event.pathParameters;
  if (!id) {
    throw new Error('"id" is required');
  }

  const result = await g.id(id);
  console.log(result);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      data: result.data.map(translateResponse).filter(each => each.url)[0]
    })
  };
};

export const listAll: APIGatewayProxyHandler = async event => {
  const limit = 25;
  const { page } = event.queryStringParameters;

  const result = await g.search({
    q: "hooray",
    offset: (+(page || "1") - 1) * limit,
    limit,
    rating: "g"
  });
  console.log(result);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      data: result.data.map(translateResponse).filter(each => each.url)
    })
  };
};

export const search: APIGatewayProxyHandler = async event => {
  const limit = 25;
  const { q } = event.queryStringParameters;
  if (!q) {
    throw new Error('"q" is required');
  }

  const result = await g.search({
    q: q,
    limit,
    rating: "g"
  });
  console.log(result);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      data: result.data.map(translateResponse).filter(each => each.url)
    })
  };
};
