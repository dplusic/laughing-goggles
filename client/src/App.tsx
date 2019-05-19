import React, { Dispatch, SetStateAction, useState } from "react";
import "./App.css";
import "./AsciiGifViewer";
import AsciiGifViewer from "./AsciiGifViewer";
import * as server from "./server";
import TextField from "@material-ui/core/TextField";
import * as ag2a from "./ag2a";
import { getParams } from "./params";

type AppState = {
  initialized: boolean;
  imageList: ag2a.AsciiGif[];
};

const params = getParams();

const handleUrlsPromise = (setState: Dispatch<SetStateAction<AppState>>) => (
  urlsPromise: Promise<string[]>
) =>
  urlsPromise
    .then(ag2a.urlsToAsciiData({ width: params.width, height: params.height }))
    .then((asciiGifs: ag2a.AsciiGif[]) => {
      setState({
        initialized: true,
        imageList: asciiGifs
      });
    });

const loadFromGiphy = (setState: Dispatch<SetStateAction<AppState>>) => (
  giphyPromise: Promise<server.ApiResponse<server.GifItems>>
) => handleUrlsPromise(setState)(giphyPromise.then(server.giphyToUrls));

const handleSubmit = (setState: Dispatch<SetStateAction<AppState>>) => (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const formElement = e.target as HTMLFormElement;
  const inputElement = formElement[0] as HTMLInputElement;
  const keyword = inputElement.value;
  return loadFromGiphy(setState)(server.search(keyword));
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    initialized: false,
    imageList: []
  });

  if (state.initialized === false) {
    if (params.url) {
      handleUrlsPromise(setState)(Promise.resolve([params.url]));
    } else {
      loadFromGiphy(setState)(server.fetchRandom50());
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit(setState)}>
          <TextField
            label="search"
            id="keyword"
            variant="filled"
            className="App-textField"
          />
        </form>
        {state.imageList.map((asciiGif, i) => (
          <AsciiGifViewer key={i} asciiGif={asciiGif} />
        ))}
      </header>
    </div>
  );
};

export default App;
