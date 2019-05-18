import React, { Dispatch, SetStateAction, useState } from "react";
import "./App.css";
import "./AsciiGifViewer";
import { AsciiGif, sampleData } from "./types/AsciiGif";
import AsciiGifViewer from "./AsciiGifViewer";
import * as server from "./server";
import TextField from "@material-ui/core/TextField";
import ag2a from "./ag2a";

type AppState = {
  initialized: boolean;
  imageList: AsciiGif[];
};

type Ag2aResponse = {
  url: string;
};

const handleGifItemsPromise = (
  setState: Dispatch<SetStateAction<AppState>>
) => (promise: Promise<server.ApiResponse<server.GifItems>>) =>
  promise
    .then(
      (apiResponse): Promise<AsciiGif[]> =>
        Promise.all(
          apiResponse.data.slice(0, 3).map((imageItem: server.GifItem) =>
            ag2a(imageItem.url, 8)
              .then((ag2aResponse: Ag2aResponse) => {
                if (ag2aResponse.url) {
                  return fetch(ag2aResponse.url);
                } else {
                  throw new Error();
                }
              })
              .then(response => response.json())
              .catch(() => null)
          )
        )
    )
    .then((asciiGifList: AsciiGif[]) => {
      setState({
        initialized: true,
        imageList: asciiGifList.filter(x => x !== null)
      });
    });

const init = (setState: Dispatch<SetStateAction<AppState>>) => {
  handleGifItemsPromise(setState)(server.fetchRandom50());
};

const handleSubmit = (setState: Dispatch<SetStateAction<AppState>>) => (
  e: any
) => {
  e.preventDefault();

  const keyword = e.target[0].value;
  handleGifItemsPromise(setState)(server.search(keyword));
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    initialized: false,
    imageList: [sampleData]
  });

  if (state.initialized === false) {
    init(setState);
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
