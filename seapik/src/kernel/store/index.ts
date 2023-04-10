import { configure } from 'mobx';

import global from './global';
import assetHandler from './assetHandler';
import historyRecord from './historyRecord';

export * from './cacheManager/adapter';
export * from './cacheManager/fetcher';

export * from './assetHandler/adapter';
export * from './global/adapter';

export { global, assetHandler, historyRecord };
configure({
  enforceActions: 'always',
});
