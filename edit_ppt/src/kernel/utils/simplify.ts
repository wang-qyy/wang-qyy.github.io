import { formatAsset, formatAudio } from '@kernel/storeAPI/AssetHandler/utils';
import type {
  RawTemplateData,
  Assets,
  Audio,
  MultipleAudio,
  BaseMultipleAudio,
} from '../typing';

function oldAudioDataToMultipleAudio(audio: Audio): BaseMultipleAudio {
  return {
    rt_title: audio.rt_title,
    resId: audio.resId,
    type: 1, // bgm:1  其他配乐:2
    rt_url: audio.rt_url,
    // 音频出入场时间
    startTime: audio.startTime,
    endTime: audio.endTime,
    volume: audio.volume,
    isLoop: audio.isLoop,
    // 音频时长
    rt_duration: audio.rt_duration,
  };
}

// 将原始接口获取的模板信息，转换成可用的数据
export function formatRawData(data: any) {
  const { doc, info } = data;
  const { work, pageAttr } = doc;
  const newData: RawTemplateData[] = [];
  const multipleAudios: MultipleAudio[] = [];

  work.forEach((item: Assets, index: number) => {
    const pageInfo = pageAttr.pageInfo[index];
    newData.push({
      assets: item,
      templateId:
        work.length === 1
          ? pageAttr.pageInfo[index].tid ?? info.last_templ_id ?? info.id
          : pageAttr.pageInfo[index].tid ?? '',
      poster: pageInfo.rt_preview_image,
      preview: pageInfo.rt_preview_video,
      pageAttr: {
        backgroundColor: pageAttr.backgroundColor[index],
        backgroundImage: pageAttr.backgroundImage[index],
        pageInfo,
        sound: pageAttr.sound[index],
      },
    });
  });

  return newData;
}

export function getAudiosFromRowData(data: any) {
  const { pageAttr } = data.doc;
  let multipleAudios: MultipleAudio[] = [];

  if (pageAttr.audios?.length) {
    multipleAudios = pageAttr.audios;
  } else if (pageAttr.sound?.[0]?.list?.length) {
    let allTime = 0;
    for (const item of pageAttr.pageInfo) {
      allTime += item.pageTime;
    }
    const audio = oldAudioDataToMultipleAudio(pageAttr.sound[0].list[0]);
    audio.startTime = 0;
    audio.endTime = allTime;
    multipleAudios.push(audio as MultipleAudio);
  }
  return multipleAudios;
}

// 将编辑器数据转换为保存数据
export function convertDataForSave(data: RawTemplateData[]) {
  const doc: any = {
    work: [],
    pageAttr: {
      backgroundColor: [],
      backgroundImage: [],
      pageInfo: [],
      sound: [],
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
    doc.pageAttr.sound.push(pageAttr.sound);
  });

  return { doc };
}
