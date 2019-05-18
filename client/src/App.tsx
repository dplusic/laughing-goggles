import React, {useState} from 'react';
import './App.css';
import './AsciiGifViewer'
import {AsciiGif, sampleData} from "./types/AsciiGif";
import AsciiGifViewer from "./AsciiGifViewer";
import * as got from 'got';

type AppState = {
  imageList : AsciiGif[];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    imageList: [sampleData,sampleData,sampleData],
  });

  got.get('https://gdg-webtech-hackathon-backend.firebaseapp.com/api/gif/random50', {})
    .then(response => {
      console.log('hi');
      console.log(response);
    });

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
