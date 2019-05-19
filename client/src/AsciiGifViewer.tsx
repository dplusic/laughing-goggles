import React, { useEffect, useState } from "react";
import "./AsciiGifViewer.css";
import { AsciiGif } from "./ag2a";
import { getParams } from "./params";

type AsciiGifViewerProps = {
  asciiGif: AsciiGif;
};

const params = getParams();

const AsciiGifViewer: React.FC<AsciiGifViewerProps> = (
  props: AsciiGifViewerProps
) => {
  const [frameIndex, setFrameIndex] = useState(0);

  const currentFrame = props.asciiGif.frames[frameIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFrameIndex(
        frameIndex < props.asciiGif.frames.length - 1 ? frameIndex + 1 : 0
      );
    }, /*currentFrame.delayMs*/ params.delay || 300);
    return () => {
      clearTimeout(timer);
    };
  }, [frameIndex]);

  return currentFrame && currentFrame ? (
    <table className="AsciiGifViewer-table" style={{ margin: 20 }}>
      <tbody>
        {currentFrame.data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((column, columnIndex) => (
              <td
                key={columnIndex}
                className="AsciiGifViewer-td"
                style={{ color: column[1] }}
              >
                {column[0]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ) : null;
};

export default AsciiGifViewer;
