import { cloneDeep } from 'lodash-es';
import { EditorState } from 'draft-js';
import { PPTTypeEnum } from './constant';
import { formatRawData } from '@/utils/simplify.old';
import { RawTemplateData, replaceAllTemplate, Asset } from '@hc/editor-core';
import { PPTNameEnum } from '@/utils/draftHandler/constant';
import { getDraftData } from '@/pages/store/global';

export function formatTextForAsset(editorState: EditorState) {
  const contentState = editorState.getCurrentContent();
  const text = contentState.getPlainText();

  // todo 待确定是否要过滤行尾无用的换行符
  // return text.replace(/(&nbsp;)/g, " ").replace(/[\r\n]+$/g, "").split("\n");
  text.replace(/(&nbsp;)/g, ' ').replace(/[\r\n]+$/g, '');
  return text;
}

const regex = {
  h1: /#([^#\n\r]*)([\r\n]*)/,
  h2: /##(.*)([\r\n]*)/,
  text: /[\n\r][^#=\d](.*)/g,
};

function strTrim(str: string | undefined) {
  return str?.replace(/^\s+|\s+$/g, '');
}

function getH1(str: string | undefined) {
  return strTrim(str?.match(regex.h1)?.[1]);
}
function getH2(str: string | undefined) {
  return strTrim(str?.match(regex.h2)?.[1]);
}
function getText(str: string | undefined) {
  return str?.match(regex.text)?.map((text) => text.replace(/[\n\r]/, ''));
}

function getList(str: string | undefined) {
  const arr: {}[] = [];
  str?.match(/[\n\r][\d]([、.\s]+)([\s\S]*)/g)?.forEach((s) => {
    s.split(/[\n\r][\d][、\s.]+/).forEach((item) => {
      if (item) {
        const temp = item.split('\n');
        arr.push({ h1: temp[0], text: temp[1] });
      }
    });
  });
  return arr;
}

function getCatalog(str: string | undefined) {
  return str
    ?.match(/[\n\r][\d]([、.\s]+)(.+)/g)
    ?.map((s) => s.replace(/[\n\r][\d][、\s.]+/, ''));
}

interface Pattern {
  type: string;
  info: { items?: number };
  data: {
    h1?: string;
    h2?: string;
    speaker?: string[];
    list?: { h1: string; text: string }[];
  };
}

export function convertTextToPattern(text: string): Pattern[] {
  const arr = text.split('\n=');

  const pattern: Pattern[] = [];
  // console.log('convertTextToPattern', { text });

  arr.forEach((str) => {
    if (!str) return;
    const type = str.match(/[^=]+(?==)/g)?.[0] ?? '';

    const tempPattern: Partial<Pattern> = {
      type,
      data: { h1: getH1(str), h2: getH2(str) },
      info: {},
    };

    switch (type) {
      case PPTTypeEnum.end:
      case PPTTypeEnum.cover:
        Object.assign(tempPattern.data, { speaker: getText(str) });
        break;
      case PPTTypeEnum.catalog:
      case PPTTypeEnum.list_img:
      case PPTTypeEnum.list:
        const list = getList(str);
        Object.assign(tempPattern.data, { list });

        Object.assign(tempPattern.info, { items: list.length });
        break;
      case PPTTypeEnum.multi_list:
        break;
      case PPTTypeEnum.transition:
        break;
    }

    pattern.push(tempPattern);
    // console.log('convertTextToPattern type', tempPattern);
  });

  return pattern;
}

export function textToPPT() {
  const inputText = getDraftData();

  const result = convertTextToPattern(inputText);

  const template: RawTemplateData[] = [];

  let transitionCache: RawTemplateData;

  result.forEach((item) => {
    const type = PPTNameEnum[item.type];

    let templates = require(`@/mock/ppt/${type}`).default as RawTemplateData[];

    if (['list', 'list_img', 'catalog'].includes(type)) {
      templates = templates.filter((t) => t.info.list_num <= item.info.items);
    }

    let len = templates.length;

    const index = Math.floor(Math.random() * len);

    let newTemplate: RawTemplateData = cloneDeep(templates[index]);

    //要求一套模板里的过渡页是同一个模板
    if (type === 'transition') {
      if (!transitionCache) {
        transitionCache = newTemplate;
      } else {
        newTemplate = transitionCache;
      }
    }

    Object.keys(item.data).forEach((key) => {
      const inputValue = item.data[key];

      if (key === 'list') {
        const h1Arr: Asset[] = newTemplate.assets.filter(
          (asset) =>
            asset.meta.type === 'text' && asset.meta.mark === 'list_h1',
        );
        const list_text_arr: Asset[] = newTemplate.assets.filter(
          (asset) =>
            asset.meta.type === 'text' && asset.meta.mark === 'list_text',
        );

        h1Arr.forEach((asset, i) => {
          const input = inputValue[i];
          const list_text = list_text_arr[i];

          if (input) {
            const { h1, text } = input;

            if (asset) {
              asset.attribute.text = [h1];
            }

            if (list_text && text) {
              list_text.attribute.text = [text];
            } else if (list_text) {
              list_text.meta.hidden = true;
            }
          } else {
            //TODO: 输入项少于模板项 逻辑待定
            asset.meta.hidden = true;
            if (list_text) {
              list_text.meta.hidden = true;
            }
          }
        });
      }
      const asset = newTemplate.assets.find(
        (i) => i.meta.mark === key && i.meta.type === 'text',
      );
      if (asset) {
        asset.attribute.text =
          typeof inputValue == 'string' ? [inputValue] : inputValue;
      }

      // console.log({
      //   index,
      //   // key,
      //   // text: asset.attribute.text,
      //   // meta: asset.meta,
      //   // newTemplate,
      // });
    });
    template.push(newTemplate);
  });

  replaceAllTemplate(template);
}

// 格式化模板数据
function replaceAttr(asset: Asset) {
  const placeholder_img =
    'https://js.seapik.com/static/images/placeholder.webp';
  asset.attribute.startTime = 0;

  if (asset.meta.type == 'image') {
    Object.assign(asset.attribute, {
      picUrl: placeholder_img,
      rt_picUrl_2k: placeholder_img,
    });
  }
  if (asset.meta.type === 'text') {
    // asset.attribute.textAlign = 'center';
    asset.attribute.fontFamily = 'Potta One';
  }

  // if (!asset.meta.mark) {
  //   asset.meta.locked = true;
  // }

  asset.assets?.forEach((child) => {
    replaceAttr(child);
  });
}

interface docInfo {
  h1: boolean;
  h2: boolean;
  list_num: number; // 目录、列表项个数
  list_text: boolean; // 目录、列表项 描述
}

function format() {
  let doc: RawTemplateData[] = require('@/mock/ppt/list').default;

  // doc = formatRawData({ doc: { doc } });

  doc.forEach((item) => {
    const info: Partial<docInfo> = {};

    item.assets.forEach((asset, i) => {
      if (asset.meta.type == 'text') {
        const text = asset.attribute.text?.join(' ');
        let mark = '';
        if (text) {
          if (text?.indexOf('##') > -1) {
            mark = 'h2';
            Object.assign(info, { h2: true });
          } else if (text?.indexOf('#') > -1) {
            mark = 'h1';
            Object.assign(info, { h1: true });
          } else if (
            text.indexOf('List subscript') > -1 ||
            text.indexOf('Table of contents') > -1 ||
            text.indexOf('Enter catalog item') > -1
          ) {
            mark = 'list_h1';
            Object.assign(info, { list_num: (info.list_num ?? 0) + 1 });
          } else if (
            text.indexOf('Please enter details') > -1 ||
            text.indexOf('content description') > -1
          ) {
            mark = 'list_text';
            Object.assign(info, { list_text: true });
          } else if (!!Number(text)) {
            mark = 'list_index';
          } else {
            mark = 'speaker';
          }
        }

        Object.assign(asset.meta, { mark });
      }

      replaceAttr(asset);
    });

    Object.assign(item, { info });
  });

  console.log('format', doc);
}

format();
