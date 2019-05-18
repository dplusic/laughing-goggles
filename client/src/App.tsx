import React, {useState} from 'react';
import './App.css';
import './AsciiGifViewer'
import {AsciiGif, sampleData} from "./types/AsciiGif";
import AsciiGifViewer from "./AsciiGifViewer";
import * as server from './server'
import {GifItems} from "./server";

type AppState = {
  initialized: boolean;
  imageList: AsciiGif[];
}

type Ag2aResponse = {
  url: string;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    initialized: false,
    imageList: [sampleData],
  });

  if (state.initialized === false) {
    server.fetchRandom50()
      .then((apiResponse: server.ApiResponse<server.GifItems>): Promise<AsciiGif[]> =>
        Promise.all(
          apiResponse.data.slice(0, 3).map((imageItem: server.GifItem) =>
            fetch(`https://ag2a.yyt.life/?url=${imageItem.url}&height=30`)
              .then(response => response.json())
              .then((ag2aResponse: Ag2aResponse) => {
                if (ag2aResponse.url) {
                  return fetch(ag2aResponse.url);
                } else {
                  throw new Error();
                }
              })
              .then(response => response.json())
              .catch(() => null)
          ))
      )
      .then((asciiGifList: AsciiGif[]) => {
        setState({
          initialized: true,
          imageList: asciiGifList.filter(x => x !== null),
        })
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        {
          state.imageList.map((asciiGif, i) => (
            <AsciiGifViewer key={i} asciiGif={asciiGif} />
          ))
        }
      </header>
    </div>
  );
};

export default App;
