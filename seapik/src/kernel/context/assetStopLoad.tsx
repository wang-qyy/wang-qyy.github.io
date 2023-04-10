import { createContext, useContext } from 'react';

export const AssetStopLoadContext = createContext(false);

export function useAssetStopLoad() {
  return useContext(AssetStopLoadContext);
}
