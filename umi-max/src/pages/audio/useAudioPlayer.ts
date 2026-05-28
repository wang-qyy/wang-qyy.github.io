// hooks/useAudioPlayer.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { AudioPlayer, AudioPlayerOptions, AudioState } from "./AudioPlayer";

export function useAudioPlayer(options: AudioPlayerOptions) {
  const [state, setState] = useState<AudioState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    loaded: false,
  });

  const [error, setError] = useState<string>();
  const playerRef = useRef<AudioPlayer | null>(null);

  // 初始化播放器
  useEffect(() => {
    const player = new AudioPlayer(options);
    playerRef.current = player;

    // 订阅状态更新
    const unsubscribeFunctions = [
      player.on("play", () => {
        setState((prev) => ({ ...prev, playing: true }));
      }),
      player.on("pause", () => {
        setState((prev) => ({ ...prev, playing: false }));
      }),
      player.on("ended", () => {
        setState((prev) => ({ ...prev, playing: false }));
      }),
      player.on("timeupdate", (event) => {
        const newState = player.getState();
        setState(newState);
      }),
      player.on("loadedmetadata", () => {
        const newState = player.getState();
        setState(newState);
      }),
      player.on("progress", () => {
        const newState = player.getState();
        setState(newState);
      }),
      player.on("volumechange", () => {
        const newState = player.getState();
        setState(newState);
      }),
      player.on("ratechange", () => {
        const newState = player.getState();
        setState(newState);
      }),
      player.on("error", (event) => {
        setError(event.data?.nativeEvent?.message || "播放错误");
      }),
    ];

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  // 更新选项
  useEffect(() => {
    if (!playerRef.current) return;

    if (
      options.src &&
      options.src !== playerRef.current.getAudioElement().src
    ) {
      setState((prevState) => ({ ...prevState, loaded: false }));

      playerRef.current.load(options.src).then(() => {
        play();
      });
    }

    if (options.volume !== undefined) {
      setVolume(options.volume);
    }

    if (options.muted !== undefined) {
      setMuted(options.muted);
    }
  }, [options.src, options.volume, options.muted]);

  const play = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "播放失败");
    }
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;

    if (state.playing) {
      pause();
    } else {
      await play();
    }
  }, [state.playing, pause, play]);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
  }, []);

  const seekByPercentage = useCallback((percentage: number) => {
    playerRef.current?.seekByPercentage(percentage);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    playerRef.current?.setMuted(muted);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  const load = useCallback((src: string) => {
    playerRef.current?.load(src);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    return playerRef.current?.formatTime(seconds) || "0:00";
  }, []);

  return {
    // 状态
    state,
    error,

    // 控制器
    play,
    pause,
    togglePlay,
    seekTo,
    seekByPercentage,
    setVolume,
    setMuted,
    setPlaybackRate,
    load,

    // 工具函数
    formatTime,

    // 播放器实例
    player: playerRef.current,
  };
}
