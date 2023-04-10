import keyboardJs, { KeyEvent } from 'keyboardjs';
import { useCallback, useEffect, useRef } from 'react';
import {
  useHistoryRecord,
  removeAsset,
  assetBlur,
  getCurrentAsset,
  AssetClass,
  assetHasParent,
  removeModuleChild,
} from '@/kernel';

import { comboCode, keyCodes } from './constant';

// 快捷键
const useShortcuts = () => {
  const { value, goNext, goPrev } = useHistoryRecord();
  const targeRef = useRef<AssetClass>();

  // 拼接code
  const concatCodeKey = (e: KeyEvent) => {
    let codeStr = e.code;
    const { pressedKeys } = e;
    Object.entries(comboCode).forEach(([key, code]) => {
      if (pressedKeys.includes(key)) codeStr += `_${code}`;
    });
    return codeStr;
  };

  // 复制元素
  function copyActiveAsset() {
    return getCurrentAsset();
  }

  // 粘贴元素
  function pasteActiveAsset(asset: AssetClass) {}

  const handle = useCallback((codeStr: string) => {
    switch (codeStr) {
      case keyCodes.KeyC_ctrlKey: // ctrl+c 复制
        targeRef.current = copyActiveAsset();
        break;
      case keyCodes.KeyV_ctrlKey: // ctrl+v 粘贴
        if (!targeRef.current) return;
        pasteActiveAsset(targeRef.current);
        break;

      case keyCodes.KeyZ_ctrlKey: // ctrl+z 后退一步
        goPrev();
        break;
      case keyCodes.KeyY_ctrlKey: // ctrl+y 前进一步
        goNext();
        break;
      case keyCodes.Delete:
      case keyCodes.Backspace: // 删除
        const asset = getCurrentAsset();
        if (asset) {
          if (assetHasParent(asset)) {
            removeModuleChild(asset);
          } else {
            removeAsset(asset);
            assetBlur();
          }
        }

        break;
      case keyCodes.KeyS_ctrlKey: // 保存草稿
        break;
    }
  }, []);

  const onKeyDown = useCallback(
    (e?: KeyEvent) => {
      if (!e) return;
      const codeStr = concatCodeKey(e);
      // console.log(codeStr, "codeStr");
      if (!(codeStr in keyCodes)) return;
      // input 输入框
      const tagName = (e.target as any)?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
      e.preventDefault();

      handle(codeStr);
    },
    [handle],
  );

  useEffect(() => {
    keyboardJs.bind('', onKeyDown);
    return () => {
      keyboardJs.unbind('');
    };
  }, [onKeyDown]);
};

export default useShortcuts;
