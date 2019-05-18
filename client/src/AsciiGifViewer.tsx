import React, {useState} from 'react';
import './AsciiGifViewer.css';
import {AsciiGif} from "./types/AsciiGif";

type AsciiGifViewerProps = {
  asciiGif: AsciiGif
}

const AsciiGifViewer: React.FC<AsciiGifViewerProps> = (props: AsciiGifViewerProps) => {
  const [frameIndex, setFrameIndex] = useState(0);

  const currentFrame = props.asciiGif.frames[frameIndex];

  setTimeout(() => {
    setFrameIndex(frameIndex < props.asciiGif.frames.length - 1 ? frameIndex + 1 : 0);
  }, /*currentFrame.delayMs*/ 300);

  return (
    <table className="AsciiGifViewer-table">
      <tbody>
      {
        currentFrame.data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {
              row.map((column, columnIndex) => (
                <td key={columnIndex} className="AsciiGifViewer-td" style={{color: column[1]}}>
                  {column[0]}
                </td>
              ))
            }
          </tr>
        ))
      }
      </tbody>
    </table>
  );
};

export default AsciiGifViewer;
