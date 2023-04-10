import React from 'react';
import { UseRequestProvider } from 'ahooks';
import { useRequestGlobalConfig } from '@/config/http';
import { store } from '@/store';
import { Provider } from 'react-redux';

// eslint-disable-next-line import/prefer-default-export
export function rootContainer(container: React.ReactElement) {
  return (
    <UseRequestProvider value={useRequestGlobalConfig}>
      <Provider store={store}>{container}</Provider>
    </UseRequestProvider>
  );
}

(window as any).EDITOR_DEBUG = {};
