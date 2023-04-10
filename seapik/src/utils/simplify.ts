import { getCanvasInfo } from '@/kernel';

import type { RawTemplateData, Assets } from '@/kernel';

// 将原始接口获取的模板信息，转换成可用的数据
export function formatRawData(data: any) {
  const { doc } = data;
  const { assets } = doc;
  const newData: RawTemplateData[] = [];

  assets.forEach((item: Assets, index: number) => {
    newData.push({
      assets: item,
      canvas: { width: data.width, height: data.height, title: '' },
      pageAttr: {
        backgroundColor: doc.pageAttr.backgroundColor[index] ?? {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        },
        pageInfo: {
          pageTime: 1000,
          baseTime: 1000,
          gifInfo: '',
          rt_preview_image: '',
        },
      },
    });
  });

  return newData;
}

// 将编辑器数据转换为保存数据
export function convertDataForSave(data: RawTemplateData[]) {
  const doc: any = {
    assets: [],
  };

  data.forEach((item) => {
    const { assets } = item;
    doc.assets.push(assets);

    Object.assign(doc, getCanvasInfo());
  });

  return doc;
}
