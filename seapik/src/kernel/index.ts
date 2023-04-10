import { whoIsNotLoaded } from '@kernel/store';

export * from './typing';

export { default as Canvas } from './Canvas';
export { default as PreviewCanvas } from './PreviewCanvas';
export { default as StaticTemplate } from './PreviewCanvas/StaticTemplate';

// api暴露
export * from './storeAPI';
export * from './utils/assetChecker';

export { customConfig } from './utils/config';
export { toJS } from 'mobx';
export { observer } from 'mobx-react';
export { whoIsNotLoaded };

// @ts-ignore
window.EDITOR_UTILS = {
  whoIsNotLoaded,
};
