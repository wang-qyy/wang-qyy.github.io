import { ContentState, EditorState } from 'draft-js';
import { Asset, AssetClass } from '@kernel/typing';

export function createFromText(text: string) {
  text.replace(' ', '&nbsp;');
  return EditorState.createWithContent(ContentState.createFromText(text));
}

// 计算一行能放的字体个数
export function calcLineFontNumber(
  fontSize: number,
  width: number,
  letterSpacing: number,
) {
  let num = 0;
  // 最多的字数
  const max = width / fontSize;
  for (let i = 1; i <= max + 1; i++) {
    if (fontSize * i + (i - 1) * letterSpacing > width) {
      num = i - 1;
      break;
    }
  }
  return num;
}

// 计算最大的行数
export function calcLineNumber(
  fontSize: number,
  height: number,
  lineHeight: number,
) {
  const num = (height / fontSize / lineHeight) * 10;
  return num;
}

// 计算文本框能装下的最大字数
export function calcTextBoxMaxText(asset: AssetClass | undefined) {
  if (asset) {
    const {
      height,
      lineHeight = 1,
      letterSpacing = 1,
      width,
    } = asset.attribute;
    const lineNum = calcLineNumber(12, height, lineHeight);
    const rowNum = calcLineFontNumber(12, width, letterSpacing);

    return lineNum * rowNum;
  }
  return 0;
}
