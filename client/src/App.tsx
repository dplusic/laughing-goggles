import React, { Dispatch, SetStateAction, useState } from "react";
import "./App.css";
import "./AsciiGifViewer";
import AsciiGifViewer from "./AsciiGifViewer";
import * as server from "./server";
import TextField from "@material-ui/core/TextField";
import * as ag2a from "./ag2a";

type AppState = {
  initialized: boolean;
  imageList: ag2a.AsciiGif[];
};

const handleGifItemsPromise = (
  setState: Dispatch<SetStateAction<AppState>>
) => (giphyPromise: Promise<server.ApiResponse<server.GifItems>>) =>
  giphyPromise
    .then(giphyResponse =>
      Promise.all(
        giphyResponse.data
          .slice(0, 3)
          .map((imageItem: server.GifItem) =>
            ag2a.toAsciiData(imageItem.url, { width: 28 })
          )
      )
    )
    .then((asciiGifs: (ag2a.AsciiGif | undefined)[]) =>
      asciiGifs.filter(Boolean).map(each => each!)
    )
    .then((asciiGifs: ag2a.AsciiGif[]) => {
      setState({
        initialized: true,
        imageList: asciiGifs
      });
    });

const init = (setState: Dispatch<SetStateAction<AppState>>) =>
  handleGifItemsPromise(setState)(server.fetchRandom50());

const handleSubmit = (setState: Dispatch<SetStateAction<AppState>>) => (
  e: any
) => {
  e.preventDefault();

  const keyword = e.target[0].value;
  return handleGifItemsPromise(setState)(server.search(keyword));
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    initialized: false,
    imageList: []
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
