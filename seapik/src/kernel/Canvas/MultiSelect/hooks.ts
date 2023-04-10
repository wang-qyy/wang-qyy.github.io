import { getEditAsset, getMoveAsset, useGetMultiSelect } from '@kernel/store';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';

export function useAssetsSelect() {
  const multiSelect = useGetMultiSelect();
  const moveAsset = getMoveAsset();
  const editAsset = getEditAsset();
  // 移动元素时不显示
  return !(moveAsset || (editAsset && editAsset.tempData.rt_inTransforming))
    ? multiSelect.map((item) => {
        return buildGeneralStyleInHandler(item);
      })
    : [];
}
