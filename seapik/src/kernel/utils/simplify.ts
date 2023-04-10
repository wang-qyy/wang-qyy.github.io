import type { RawTemplateData, Assets } from '../typing';

// 将原始接口获取的模板信息，转换成可用的数据
export function formatRawData(data: any) {
  const { doc, info } = data;
  const { work, pageAttr } = doc;
  const newData: RawTemplateData[] = [];

  work.forEach((item: Assets, index: number) => {
    const pageInfo = pageAttr.pageInfo[index];
    newData.push({
      assets: item,
      templateId:
        work.length === 1
          ? pageAttr.pageInfo[index].tid ?? info.last_templ_id ?? info.id
          : pageAttr.pageInfo[index].tid ?? '',
      poster: pageInfo.rt_preview_image,
      pageAttr: {
        backgroundColor: pageAttr.backgroundColor[index],
        backgroundImage: pageAttr.backgroundImage[index],
        pageInfo,
      },
    });
  });

  return newData;
}

// 将编辑器数据转换为保存数据
export function convertDataForSave(data: RawTemplateData[]) {
  const doc: any = {
    work: [],
    pageAttr: {
      backgroundColor: [],
      backgroundImage: [],
      pageInfo: [],
    },
  };

  data.forEach((item) => {
    const { assets, pageAttr } = item;
    doc.work.push(assets);
    doc.pageAttr.backgroundColor.push(pageAttr.backgroundColor);
    doc.pageAttr.backgroundImage.push(pageAttr.backgroundImage);
    doc.pageAttr.pageInfo.push({
      ...pageAttr.pageInfo,
      tid: item.templateId ?? '',
    });
  });

  return { doc };
}
