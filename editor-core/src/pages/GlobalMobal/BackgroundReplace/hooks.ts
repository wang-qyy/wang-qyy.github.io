import { message } from 'antd';

import { getResAssets } from '@/pages/Content/ConciseMode/store/adapter';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import { getOneReplaceList } from '@/pages/Content/OnekeyRepalce/store/adapter';

export const useSelectItem = () => {
  const {
    value: { selectedList },
    updateSelectedList,
  } = useAssetReplaceModal();

  const resAssets = getResAssets();
  const unreplacedList = resAssets.filter(t => !t.replaced);

  const selectItem = (item: any) => {
    const { resId, ufsId } = item;
    const list: any[] = [...selectedList];

    const index = list.findIndex(
      t => `${t.resId}${t.ufsId}` === `${resId}${ufsId}`,
    );
    if (index === -1) {
      if (unreplacedList.length === list.length) {
        message.warn('批量替换图片已达到上限！');
        return;
      }
      list.push(item);
    } else {
      list.splice(index, 1);
    }
    updateSelectedList(list);
  };

  return selectItem;
};
export const useSelectItemOneKeyReplace = () => {
  const {
    value: { selectedList },
    updateSelectedList,
  } = useAssetReplaceModal();

  const resAssets = getOneReplaceList();
  const unreplacedList = resAssets.filter(t => !t.replaced);

  const selectItem = (item: any) => {
    const { resId, ufsId } = item;
    const list: any[] = [...selectedList];

    const index = list.findIndex(
      t => `${t.resId}${t.ufsId}` === `${resId}${ufsId}`,
    );
    if (index === -1) {
      if (unreplacedList.length === list.length) {
        message.warn('批量替换图片已达到上限！');
        return;
      }
      list.push(item);
    } else {
      list.splice(index, 1);
    }
    updateSelectedList(list);
  };

  return selectItem;
};
