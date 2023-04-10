export class AutoDestroyVideoHandler {
  video: HTMLVideoElement;

  isLoop: boolean;

  clip?: [number, number];

  playPromise?: Promise<void>;

  constructor(
    video: HTMLVideoElement,
    isLoop: boolean,
    clip?: [number, number],
  ) {
    this.video = video;
    this.isLoop = isLoop;
    this.clip = clip;
  }

  onTimeUpdate = () => {
    if (!this.clip) {
      return;
    }
    const [start, end] = this.clip || [0, 0];
    const { currentTime } = this.video;
    const startTime = start / 1000;
    const endTime = end / 1000;
    if (currentTime > endTime) {
      if (this.isLoop) {
        this.video.currentTime = startTime;
      } else {
        if (!this.video.paused) {
          this.video.pause();
          this.video.currentTime = endTime;
        }
      }
    }
  };

  play = () => {
    const [currentTime] = this.clip || [0, 0];
    this.video.currentTime = currentTime / 1000;
    this.playPromise = this.video.play();
  };

  pause = () => {
    // console.log(this.playPromise);
    if (this.playPromise) {
      this.playPromise.then(() => {
        // console.log(1111);
        this.video.pause();
        this.playPromise = undefined;
      });
    } else {
      this.video.pause();
    }
  };
}
