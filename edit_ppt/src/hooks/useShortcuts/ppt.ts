import { useCallback, useEffect, useRef } from 'react';
import keyboardJs, { KeyEvent } from 'keyboardjs';
import {
  setCurrentTime,
  getCurrentTemplateIndex,
  getTemplateTimeScale,
  AssetClass,
} from '@/kernel';

import { comboCode, keyCodes } from './constant';

// 快捷键
const useShortcuts = () => {
  // 拼接code
  const concatCodeKey = (e: KeyEvent) => {
    let codeStr = e.code;
    const { pressedKeys } = e;
    Object.entries(comboCode).forEach(([key, code]) => {
      if (pressedKeys.includes(key)) codeStr += `_${code}`;
    });
    return codeStr;
  };

  function change(num = 1) {
    const index = getCurrentTemplateIndex() ?? 0;
    const timeScale = getTemplateTimeScale();

    let target = index + num;
    const maxIndex = timeScale.length - 1;
    if (target > maxIndex) {
      target = 0;
    } else if (target < 0) {
      target = maxIndex;
    }

    setCurrentTime(timeScale[target][0], false);
  }

  const handle = useCallback((codeStr: string) => {
    switch (codeStr) {
      case keyCodes.ArrowLeft:
      case keyCodes.ArrowUp:
        change(-1);
        break;
      case keyCodes.ArrowDown:
      case keyCodes.ArrowRight:
        change(1);
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
