import { Checkbox } from 'antd';
import {
  useGetCurrentInfoByObserver,
  isModuleType,
  observer,
  AssetClass,
  isTempModuleType,
} from '@hc/editor-core';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { reportChange } from '@/kernel/utils/config';

function canSet(asset: AssetClass) {
  const res =
    isTempModuleType(asset) ||
    !(isModuleType(asset) || asset.meta.type === 'text');

  return res;
}

function SetAssetIsQuickEditor() {
  const { currentAsset, multiSelect, moduleItemActive } =
    useGetCurrentInfoByObserver();

  const targetAsset = moduleItemActive ?? currentAsset;

  if (
    !(moduleItemActive
      ? canSet(moduleItemActive)
      : currentAsset && canSet(currentAsset))
  ) {
    return <></>;
  }

  const checked = () => {
    let isQuickEditor = targetAsset?.meta.isQuickEditor;
    if (multiSelect?.length) {
      multiSelect.forEach(item => {
        if (!item.meta.isQuickEditor) {
          isQuickEditor = item.meta.isQuickEditor;
        }
      });
    }

    return isQuickEditor;
  };

  function onChange(e: CheckboxChangeEvent) {
    const isQuickEditor = e.target.checked;

    if (multiSelect.length) {
      multiSelect.forEach(item => {
        if (canSet(item)) {
          // 文字和组跳过设置
          item.update({ meta: { isQuickEditor } });
        }
      });
    } else if (targetAsset) {
      targetAsset.update({ meta: { isQuickEditor } });
    }

    reportChange('isQuickEditor', true);
  }

  return (
    <Checkbox
      checked={checked()}
      onChange={onChange}
      style={{ color: '#fff', fontSize: 12 }}
    >
      可替换
    </Checkbox>
  );
}

export default observer(SetAssetIsQuickEditor);
