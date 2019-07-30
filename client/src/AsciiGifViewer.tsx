import React, { MutableRefObject, useEffect, useRef } from "react";
import "./AsciiGifViewer.css";
import { AsciiGif } from "./ag2a";
import { getParams } from "./params";
import { Terminal } from "xterm";

require("xterm/dist/xterm.css");

type AsciiGifViewerProps = {
  asciiGif: AsciiGif;
};

const params = getParams();

const AsciiGifViewer: React.FC<AsciiGifViewerProps> = (
  props: AsciiGifViewerProps
) => {
  const xtermParentRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {

    const terminal = new Terminal({
      rows: props.asciiGif.height,
      cols: props.asciiGif.width * 2,
      scrollback: 0,
      fontWeight: 'bold',
      lineHeight: 0.85,
      convertEol: true,
      disableStdin: true,
      cursorStyle: undefined,
    });
    terminal.open(xtermParentRef.current as HTMLDivElement);

    let timer: number | undefined;
    let frameIndex = 0;

    const draw = () => {
      const currentFrame = props.asciiGif.frames[frameIndex];

      terminal.write("\n");
      terminal.write(currentFrame.data);

      frameIndex = frameIndex < props.asciiGif.frames.length - 1 ? frameIndex + 1 : 0;

      timer = window.setTimeout(draw, params.delay || currentFrame.delayMs);
    };
    draw();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      terminal.dispose();
    }
  });

  return (
    <div ref={xtermParentRef} />
  );
};

export default AsciiGifViewer;
