import store from './store';

export function useTexts() {
  return { texts: store.texts, loading: store.loading };
}

export function loadTexts() {
  store.getTexts();
}
