import store from './store';

export function setPollingStatus(status: boolean) {
  store.setPollingStatus(status);
}
export function getPollingStatus() {
  return store.polling;
}

export function setLimitStatus(status: boolean) {
  store.setLimitStatus(status);
}

export function useDownloadStatus() {
  return { limit: store.limit, setLimitStatus };
}
