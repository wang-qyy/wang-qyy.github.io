import { getFontStyle } from '@/kernel/utils/assetHelper/font';
import { useEffect, useRef, useState } from 'react';

const CaluFontSize = (props: any) => {
  const { textEditAsset, currentText, onChange } = props;
  const { width, height, fontSize, letterSpacing } = textEditAsset?.attribute;
  const fontStyle = getFontStyle(textEditAsset);
  const normalFont = useRef<HTMLDivElement>(null);
  const [currentFontSize, setCurrentFontSize] = useState(fontSize);
  const floorHeight = Math.floor(height);
  // 计算字体大小
  function calcFont() {
    if (!normalFont.current) {
      return;
    }
    if (normalFont.current?.offsetHeight > floorHeight) {
      for (let i = fontSize; i >= 12; i--) {
        setCurrentFontSize(Math.ceil(i));
        if (normalFont.current?.offsetHeight <= floorHeight) {
          onChange(Math.floor(i));
          break;
        }
      }
    } else {
      for (let i = fontSize; i <= 600; i++) {
        setCurrentFontSize(Math.ceil(i));

        if (normalFont.current?.offsetHeight > floorHeight) {
          onChange(Math.floor(i - 1));
          break;
        }
        if (normalFont.current?.offsetHeight == floorHeight) {
          onChange(Math.floor(i));
          break;
        }
      }
    }
  }
  useEffect(() => {
    if (currentText && normalFont.current) {
      setTimeout(() => {
        // 允许出入1px
        if (normalFont.current?.offsetHeight !== floorHeight) {
          // 计算合适的字体大小
          calcFont();
        }
      }, 0);
    }
  }, [currentText]);
  useEffect(() => {
    if (fontSize) {
      setCurrentFontSize(fontSize);
    }
  }, [fontSize]);
  return (
    <div
      ref={normalFont}
      style={{
        ...fontStyle,
        position: 'absolute',
        left: 0,
        top: 500,
        background: 'red',
        width,
        fontSize: currentFontSize,
        letterSpacing,
        wordBreak: 'break-all',
        writingMode: 'horizontal-tb',
      }}
      className="hc-unVisibility"
      dangerouslySetInnerHTML={{ __html: currentText }}
    />
  );
};
export default CaluFontSize;
