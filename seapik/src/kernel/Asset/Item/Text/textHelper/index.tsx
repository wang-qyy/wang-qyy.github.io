import React from 'react';
import {
  forEachText,
  getAllTextLength,
} from '@AssetCore/Item/Text/components/originText/utils';
import {
  Refs,
  TextPositionObject,
} from '@AssetCore/Item/Text/components/originText/typing';

export class TextDomHandler {
  renderText: React.ReactElement[] = [];

  textRefs: Refs = {};

  textPosition: TextPositionObject = {};

  textRefKeys: string[] = [];

  textInstance: string[] = [];

  textHtml = '';

  originText: string[] = [];

  textNumber = 0;

  updateText = (text: string[]) => {
    const textInstance: string[] = [];
    const textRefKeys: string[] = [];
    const renderText: React.ReactElement[] = [];
    const setRefs = (key: string, ref: HTMLSpanElement | null) => {
      this.textRefs[key] = ref;
    };
    forEachText(text, {
      parentCb: ({ value }) => {
        textInstance.push(
          value
            .replace(/&/g, '&#38;')
            .replace(/</g, '&#60;')
            .replace(/>/g, '&#62;'),
        );
      },
      itemCb: ({ key, itemValue }) => {
        const str = itemValue.replace(/(\s)/g, `&nbsp;`);
        textRefKeys.push(key);
        renderText.push(
          <span
            className="__renderText"
            ref={(ref) => {
              setRefs(key, ref);
            }}
            dangerouslySetInnerHTML={{ __html: str }}
            key={key}
          />,
        );
      },
      endCb: ({ index, textArrayLength }) => {
        if (index !== textArrayLength - 1) {
          renderText.push(<br key={`br-${index}`} />);
        }
      },
    });

    this.textHtml = textInstance
      .join('<br/>')
      .replace(/(\s)/g, '&nbsp;')
      .replace(/(&nbsp;&nbsp;)/g, '&nbsp; ');
    this.renderText = renderText;
    this.textInstance = textInstance;
    this.textRefKeys = textRefKeys;
    this.textNumber = getAllTextLength(text);
    this.originText = text;
  };

  updateTextPosition = () => {
    const posObj: TextPositionObject = {};
    this.textRefKeys.forEach((key) => {
      const node = this.textRefs[key];
      if (node) {
        posObj[key] = {
          left: node.offsetLeft,
          top: node.offsetTop,
          width: node.offsetWidth,
          height: node.offsetHeight,
        };
      }
    });
    this.textPosition = posObj;
  };
}
