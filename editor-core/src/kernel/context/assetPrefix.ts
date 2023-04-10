import { createContext, useContext } from 'react';

export const AssetPrefixContext = createContext('');

export function useGetAssetPrefix() {
  return useContext(AssetPrefixContext);
}
