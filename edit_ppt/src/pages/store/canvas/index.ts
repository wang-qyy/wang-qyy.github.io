import store, { CanvasInfo } from './store';

export function useLoadStatus() {
  return { loaded: store.loaded, update: store.setLoadStatus };
}

export function updateCanvas(info: CanvasInfo) {
  store.setCanvasSize(info);
}

export function useCanvasInfo() {
  return {
    value: store.canvasInfo,
    update: updateCanvas,
  };
}

export function setUrl(url: string) {
  store.setUrl(url);
}

export function getUrl() {
  return store.url;
}
