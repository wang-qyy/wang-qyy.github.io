import { configure } from 'mobx';

import global from './global';
import assetHandler from './assetHandler';
import audioHandler from './audioHandler';
import historyRecord from './historyRecord';

export * from './cacheManager/adapter';
export * from './cacheManager/fatcher';

export * from './assetHandler/adapter';
export * from './audioHandler/adapter';
export * from './global/adapter';

export { global, assetHandler, audioHandler, historyRecord };
configure({
  enforceActions: 'always',
});
