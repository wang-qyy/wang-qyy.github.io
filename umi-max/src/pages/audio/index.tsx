import { Button } from "antd";
import { useState, useEffect } from "react";

import { useAudioPlayer } from "./useAudioPlayer";

const urls = [
  "https://img.pikbest.com/mp3Watermark_best/00/81/14/5a16de602143c16a87ee7dc91ae429ca.mp3",
  "https://img.pikbest.com/mp3Watermark_best/09/42/04/611782f65b2399ddec902f8031b11da8.mp3",
];

let index = 0;
export default () => {
  const [url, setUrl] = useState(urls[index]);

  const { formatTime, state, togglePlay, seekByPercentage } = useAudioPlayer({
    src: url,
    autoplay: false,
    crossOrigin: "anonymous",
  });
  async function onClick() {
    togglePlay();
  }

  function onNext() {
    index = (index + 1) % urls.length;
    setUrl(urls[index]);
  }

  useEffect(() => {
    if (state.currentTime >= state.duration) {
      onNext();
    }
  }, [state.currentTime, state.duration]);

  return (
    <div>
      <Button onClick={onNext}>下一首</Button>
      <Button onClick={onClick}>{state.playing ? "pause" : "play"}</Button>

      <div
        style={{
          background: "#eee",
          height: 8,
          position: "relative",
          width: "50vw",
          margin: "0 auto",
        }}
        onClick={(e) => {
          const rect = (e.target as HTMLDivElement).getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          seekByPercentage((offsetX / rect.width) * 100);
        }}
      >
        <div
          style={{
            height: "100%",
            background: "green",
            position: "absolute",
            left: 0,
            top: 0,
            width: `${state.progress}%`,
            pointerEvents: "none",
          }}
        ></div>
      </div>

      <div>{formatTime(state.currentTime)}</div>
      <div>error: {state.error}</div>

      {state.loaded ? 1 : 2}
    </div>
  );
};
