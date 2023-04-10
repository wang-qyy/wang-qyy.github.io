import AssetItemState from '@kernel/store/assetHandler/asset/index';
import { getTempModuleData } from '@kernel/store/assetHandler/adapter/Handler/Creator';

export function createTempModule() {
  return new AssetItemState(getTempModuleData());
}
