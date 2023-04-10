import { CSSProperties } from 'react';
import { RGBAToString, transferGradientToString } from '@kernel/utils/single';
import { AssetClass } from '@/kernel';
import { backupFontFamily } from '@kernel/utils/defaultConfig';
import { DEFAULT_FONT_SIZE } from '@kernel/utils/assetHelper/const';
import { EditorState, ContentState } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';

/**
 * @description 获取字体样式
 * @param asset
 */
export function getFontStyle(asset?: AssetClass): CSSProperties {
  if (!asset) {
    return {};
  }
  const { attribute, fontFamily = '' } = asset;

  const {
    letterSpacing = 0,
    lineHeight = 0,
    fontSize = 1,
    textAlign = 'center',
    textDecoration,
    fontStyle,
    writingMode = 'horizontal-tb',
    fontWeight,
    outline,
  } = attribute;

  const style: CSSProperties = {
    fontSize: DEFAULT_FONT_SIZE,
    fontStyle,
    textDecoration,
    fontFamily: `${fontFamily}, ${backupFontFamily}`,
    lineHeight: lineHeight / 10,
    letterSpacing: (letterSpacing / fontSize) * DEFAULT_FONT_SIZE,
    wordBreak: 'break-all',
    textAlign,
    writingMode,
    fontWeight,
  };

  // if (outline) {
  //   Object.assign(style, {
  //     WebkitTextStroke: `${outline.width}px ${RGBAToString(outline.color)}`,
  //   });
  // }

  if (attribute.color) {
    if (attribute.color.type) {
      Object.assign(style, {
        backgroundImage: transferGradientToString(attribute.color),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      });
    } else {
      Object.assign(style, { color: RGBAToString(attribute.color) });
    }
  }
  // console.log(outline, style);

  return style;
}

/**
 * @description 获取元素容器的尺寸与缩放
 * @param asset
 */
export function getFontContainerStyle(asset: AssetClass): CSSProperties {
  const { containerSize, fontSizeScale } = asset;

  return {
    transformOrigin: '0 0 0',
    transform: `scale(${fontSizeScale}) translateZ(0px)`,
    width: containerSize.width / fontSizeScale,
    height: containerSize.height / fontSizeScale,
  };
}

export function formatTextForEditor(text: string[] | undefined = []) {
  if (!text) {
    return '';
  }
  return text.join('\n');
}

export function spaceToNbsp(editorState: EditorState) {
  const contentState = editorState.getCurrentContent();
  const text = contentState.getPlainText();
  const newText = text.replace(/([\s| ])/g, '&nbsp;');

  const newContent = ContentState.createFromText(newText);

  return EditorState.createWithContent(newContent);
}

export function formatTextForAsset(editorState: EditorState) {
  const contentState = editorState.getCurrentContent();
  const text = contentState.getPlainText();
  // todo 待确定是否要过滤行尾无用的换行符
  // return text.replace(/(&nbsp;)/g, " ").replace(/[\r\n]+$/g, "").split("\n");
  return text
    .replace(/(&nbsp;)/g, ' ')
    .replace(/[\r\n]+$/g, '')
    .split('\n');
}

export function formatTextForAssetAttr(text: string[]) {
  const textInstance: string[] = [];
  text.forEach((value) => {
    textInstance.push(
      value
        .replace(/&/g, '&#38;')
        .replace(/</g, '&#60;')
        .replace(/>/g, '&#62;'),
    );
  });
  return textInstance
    .join('<br/>')
    .replace(/(\s)/g, '&nbsp;')
    .replace(/(&nbsp;&nbsp;)/g, '&nbsp; ');
}
