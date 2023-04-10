/**
 * @description 检测是否按住了某键
 */
class HoldKey {
  key: string | null = null;

  constructor() {
    document.addEventListener('keydown', e => {
      if (e.key !== this.key) {
        this.key = e.key;
      }
    });
    document.addEventListener('keyup', () => {
      this.key = null;
    });
    document.addEventListener('visibilitychange', () => {
      this.key = null;
    });
  }
}

export const holdKey = new HoldKey();
