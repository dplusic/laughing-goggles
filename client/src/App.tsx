import React, { Dispatch, SetStateAction, useState } from "react";
import "./App.css";
import "./AsciiGifViewer";
import AsciiGifViewer from "./AsciiGifViewer";
import * as server from "./server";
import TextField from "@material-ui/core/TextField";
import * as ag2a from "./ag2a";
import { getParams } from "./params";

const params = getParams();

const handleUrlsPromise = (setItems: Dispatch<SetStateAction<ag2a.UrlAndAsciiGif[]>>) => (
  urlsPromise: Promise<string[]>
) =>
  urlsPromise
    .then(ag2a.urlsToAsciiData({ width: params.width, height: params.height }))
    .then(setItems);

const loadFromGiphy = (setItems: Dispatch<SetStateAction<ag2a.UrlAndAsciiGif[]>>) => (
  giphyPromise: Promise<server.ApiResponse<server.GifItems>>
) => handleUrlsPromise(setItems)(giphyPromise.then(server.giphyToUrls));

const handleSubmit = (setItems: Dispatch<SetStateAction<ag2a.UrlAndAsciiGif[]>>) => (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const formElement = e.target as HTMLFormElement;
  const inputElement = formElement[0] as HTMLInputElement;
  const keyword = inputElement.value;
  return loadFromGiphy(setItems)(server.search(keyword));
};

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [items, setItems] = useState<ag2a.UrlAndAsciiGif[]>([]);

  if (initialized === false) {
    if (params.url) {
      handleUrlsPromise(setItems)(Promise.resolve([params.url]));
    } else {
      loadFromGiphy(setItems)(server.fetchRandom50());
    }
    setInitialized(true);
  }

  return (
    <div className="App">
      <div className="App-body">
        <form onSubmit={handleSubmit(setItems)}>
          <TextField
            label="search"
            id="keyword"
            variant="filled"
            className="App-textField"
          />
        </form>
        {items.map(([gifUrl, asciiGif]) => (
          <div key={gifUrl} className="App-asciiGifViewerWrapper">
            <AsciiGifViewer asciiGif={asciiGif} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
