import React, { useContext } from 'react';
import { Asset } from '@kernel/typing';
import { config } from '@kernel/utils/config';
// 通过CanvasKey区分操作的store
export const CanvasKeyContext = React.createContext('');

export function useGetCanvasKey() {
  return useContext(CanvasKeyContext);
}

export function useCanvasHooks() {
  function change(asset: Asset) {
    config.onChange?.(asset);
  }

  function error(asset: Asset, error?: any) {
    if (error) {
      console.error(error);
    }
    config.onError?.(asset, error);
  }

  return {
    onError: error,
    onChange: change,
  };
}
