// AudioPlayer.ts
export class AudioPlayer {
  private audio: HTMLAudioElement;
  private state: AudioState;
  private eventHandlers: Map<AudioEventType, Set<EventHandler>> = new Map();
  private progressInterval?: number;
  private isDestroyed: boolean = false;

  constructor(options: AudioPlayerOptions) {
    this.audio = new Audio();
    this.state = this.createInitialState();

    this.applyOptions(options);
    this.bindAudioEvents();
    this.setupProgressTracking();
  }

  private createInitialState(): AudioState {
    return {
      playing: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      buffered: 0,
      volume: 1,
      muted: false,
      playbackRate: 1,
      loaded: false,
      error: undefined,
    };
  }

  private applyOptions(options: AudioPlayerOptions): void {
    this.audio.src = options.src;

    if (options.volume !== undefined) {
      this.setVolume(options.volume);
    }

    if (options.muted !== undefined) {
      this.setMuted(options.muted);
    }

    if (options.playbackRate !== undefined) {
      this.setPlaybackRate(options.playbackRate);
    }

    if (options.autoplay) {
      this.play().catch(console.warn);
    }

    if (options.loop !== undefined) {
      this.audio.loop = options.loop;
    }

    if (options.preload) {
      this.audio.preload = options.preload;
    }

    if (options.crossOrigin) {
      this.audio.crossOrigin = options.crossOrigin;
    }
  }

  private bindAudioEvents(): void {
    const events: AudioEventType[] = [
      "play",
      "pause",
      "ended",
      "timeupdate",
      "progress",
      "loadedmetadata",
      "canplay",
      "error",
      "volumechange",
      "ratechange",
    ];

    events.forEach((eventType) => {
      this.audio.addEventListener(eventType.toLowerCase(), (event) => {
        this.updateStateFromEvent(eventType);
        this.emit(eventType, { nativeEvent: event });
      });
    });
  }

  private updateStateFromEvent(eventType: AudioEventType): void {
    switch (eventType) {
      case "play":
        this.state.playing = true;
        break;
      case "pause":
      case "ended":
        this.state.playing = false;
        break;
      case "loadedmetadata":
        this.state.duration = this.audio.duration;
        this.state.loaded = true;
        break;
      case "timeupdate":
        this.state.currentTime = this.audio.currentTime;
        if (this.state.duration > 0) {
          this.state.progress =
            (this.state.currentTime / this.state.duration) * 100;
        }
        break;
      case "progress":
        this.state.buffered = this.calculateBufferedProgress();
        break;
      case "volumechange":
        this.state.volume = this.audio.volume;
        this.state.muted = this.audio.muted;
        break;
      case "ratechange":
        this.state.playbackRate = this.audio.playbackRate;
        break;
      case "error":
        this.state.error = this.getErrorMessage();
        break;
    }
  }

  private calculateBufferedProgress(): number {
    if (!this.audio.buffered.length || this.state.duration <= 0) {
      return 0;
    }

    const currentTime = this.state.currentTime;
    let bufferedEnd = 0;

    for (let i = 0; i < this.audio.buffered.length; i++) {
      if (this.audio.buffered.start(i) <= currentTime) {
        bufferedEnd = Math.max(bufferedEnd, this.audio.buffered.end(i));
      }
    }

    return (bufferedEnd / this.state.duration) * 100;
  }

  private getErrorMessage(): string {
    if (!this.audio.error) return "";

    const error = this.audio.error;
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        return "播放被中止";
      case error.MEDIA_ERR_NETWORK:
        return "网络错误";
      case error.MEDIA_ERR_DECODE:
        return "解码错误";
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "音频格式不支持";
      default:
        return "未知错误";
    }
  }

  private setupProgressTracking(): void {
    this.progressInterval = window.setInterval(() => {
      if (!this.isDestroyed && this.state.playing) {
        this.updateStateFromEvent("timeupdate");
        this.emit("timeupdate", {});
      }
    }, 100);
  }

  // 公共API
  public async play(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error("播放器已被销毁");
    }

    try {
      await this.audio.play();
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : "播放失败";
      throw error;
    }
  }

  public pause(): void {
    this.audio.pause();
  }

  public togglePlay(): Promise<void> | void {
    if (this.state.playing) {
      this.pause();
    } else {
      return this.play();
    }
  }

  public seekTo(time: number): void {
    if (this.isDestroyed) return;

    if (time < 0) time = 0;
    if (this.state.duration > 0 && time > this.state.duration) {
      time = this.state.duration;
    }

    this.audio.currentTime = time;
    this.state.currentTime = time;

    if (this.state.duration > 0) {
      this.state.progress = (time / this.state.duration) * 100;
    }
  }

  public seekByPercentage(percentage: number): void {
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    if (this.state.duration > 0) {
      const time = (percentage / 100) * this.state.duration;
      this.seekTo(time);
    }
  }

  public setVolume(volume: number): void {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;

    this.audio.volume = volume;
    this.state.volume = volume;
  }

  public setMuted(muted: boolean): void {
    this.audio.muted = muted;
    this.state.muted = muted;
  }

  public setPlaybackRate(rate: number): void {
    if (rate < 0.5) rate = 0.5;
    if (rate > 4) rate = 4;

    this.audio.playbackRate = rate;
    this.state.playbackRate = rate;
  }

  public load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audio.pause();
      this.state.loaded = false;
      this.state.error = undefined;

      setTimeout(() => {
        this.audio.src = src;
        this.audio.load();
        resolve();
      }, 0);
    });
  }

  public getState(): Readonly<AudioState> {
    return { ...this.state };
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  public formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  }

  // 事件系统
  public on(eventType: AudioEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add((e) => {
      if (eventType !== "timeupdate") {
        console.log("on", eventType);
      }
      handler(e);
    });

    // 返回取消订阅函数
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  public off(eventType: AudioEventType, handler: EventHandler): void {
    this.eventHandlers.get(eventType)?.delete(handler);
  }

  private emit(eventType: AudioEventType, data?: any): void {
    if (this.isDestroyed) return;

    const event: AudioPlayerEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    this.eventHandlers.get(eventType)?.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }

  public destroy(): void {
    this.isDestroyed = true;

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.pause();
    this.audio.src = "";
    this.audio.load();

    this.eventHandlers.clear();
  }
}

// types/audio-plugin.ts
export interface AudioPlayerOptions {
  /** 音频源URL */
  src: string;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 初始音量 0-1 */
  volume?: number;
  /** 是否静音 */
  muted?: boolean;
  /** 播放速率 0.5-4 */
  playbackRate?: number;
  /** 是否预加载 */
  preload?: "none" | "metadata" | "auto";
  /** 跨域设置 */
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface AudioState {
  /** 是否正在播放 */
  playing: boolean;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 音频总时长（秒） */
  duration: number;
  /** 播放进度百分比 0-100 */
  progress: number;
  /** 缓冲进度百分比 0-100 */
  buffered: number;
  /** 音量 0-1 */
  volume: number;
  /** 是否静音 */
  muted: boolean;
  /** 播放速率 */
  playbackRate: number;
  /** 是否已加载 */
  loaded: boolean;
  /** 错误信息 */
  error?: string;
}

export interface AudioProgressEvent {
  /** 当前时间（秒） */
  currentTime: number;
  /** 总时长（秒） */
  duration: number;
  /** 进度百分比 */
  progress: number;
  /** 格式化当前时间 */
  formattedCurrent: string;
  /** 格式化总时长 */
  formattedDuration: string;
}

export interface PlaybackQuality {
  /** 比特率 */
  bitrate?: number;
  /** 采样率 */
  sampleRate?: number;
  /** 声道数 */
  channels?: number;
}

export type AudioEventType =
  | "play"
  | "pause"
  | "ended"
  | "timeupdate"
  | "progress"
  | "loadedmetadata"
  | "canplay"
  | "error"
  | "volumechange"
  | "ratechange";

export interface AudioPlayerEvent {
  type: AudioEventType;
  data?: any;
  timestamp: number;
}

export type EventHandler = (event: AudioPlayerEvent) => void;
