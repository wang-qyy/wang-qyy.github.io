import {
  RawTemplateData,
  Assets,
  Audio,
  BaseMultipleAudio,
  MultipleAudio,
  getAllAudios,
  getAudioEditStatus,
} from '@/kernel';

import getUrlParams from '@/utils/urlProps';

export function getPoster(assets: Assets = []) {
  // console.log(toJS(assets));
  return assets.find((item) => item.meta.type === 'videoE');
}

// 将原始接口获取的模板信息，转换成可用的数据
export function formatRawData(data: any) {
  const { doc, info } = data;

  const { work, pageAttr, canvas, widgets } = doc.doc;
  const newData: RawTemplateData[] = [];

  work.forEach((item: Assets, index: number) => {
    const pageInfo = pageAttr.pageInfo[index];
    let aqe;

    if (Array.isArray(pageAttr.aqe)) {
      aqe = pageAttr.aqe[index];
    }

    newData.push({
      canvas: { ...canvas, title: doc.title },
      assets: item,
      // templateId:'',
      poster: pageInfo.rt_preview_image,
      preview: pageInfo.rt_preview_video,
      preview_url: doc.preview_url || '',
      // small_url: info.small_url || '',
      pageAttr: {
        backgroundColor: pageAttr.backgroundColor[index],
        backgroundImage: pageAttr.backgroundImage[index],
        pageInfo,
        sound: { list: [] },
        aqe,
      },
      cameras: (widgets && widgets[index] && widgets[index].cameras) || [],
    });
  });
  return newData;
}

// 将编辑器数据转换为保存数据
export function convertDataForSave(data: RawTemplateData[]) {
  const audios = getAllAudios();
  const replaced = getAudioEditStatus();

  const doc: any = {
    work: [],
    pageAttr: {
      backgroundColor: [],
      backgroundImage: [],
      pageInfo: [],
      sound: [
        {
          list: [],
        },
      ],
      music: {
        audios: audios.map((item: Audio) => {
          return {
            ...item,
            rt_id: undefined,
            rt_loadInfo: undefined,
          };
        }),
        replaced: false,
      },
      aqe: [],
    },
    widgets: [],
  };

  data.forEach((item) => {
    const { assets, pageAttr, cameras } = item;
    doc.work.push(assets);
    doc.pageAttr.backgroundColor.push(pageAttr.backgroundColor);
    doc.pageAttr.backgroundImage.push(pageAttr.backgroundImage);
    doc.pageAttr.pageInfo.push({
      ...pageAttr.pageInfo,
      tid: String(item.templateId ?? ''),
    });
    // doc.pageAttr.sound.push(pageAttr.sound);
    if (Array.isArray(pageAttr.aqe)) {
      doc.pageAttr.aqe.push(pageAttr.aqe);
    }
    doc.widgets.push({ cameras });
  });

  return { doc };
}

function oldAudioDataToMultipleAudio(audio: any): BaseMultipleAudio {
  const data = {
    rt_title: audio.rt_title,
    resId: audio.resId,
    type: 2, // bgm:1  其他配乐:2
    rt_url: audio.rt_url,
    // 音频出入场时间
    startTime: audio.startTime,
    endTime: audio.endTime,
    volume: audio.volume,
    isLoop: audio.isLoop,
    // 音频时长
    rt_duration: audio.rt_duration,
  };

  // if (!(audio.selfStartTime == 0 && audio.selfStartTime == audio.rt_duration)) {
  //   data.cut = [audio.selfStartTime, audio.selfStartTime + audio.rt_duration];
  // }
  return data;
}

/**
 * @description 提起多音轨数据
 * @param data
 */
export function getAudiosFromRowData(data: any) {
  const { pageAttr } = data.doc;
  let multipleAudios: MultipleAudio[] = [];

  if (pageAttr?.music?.audios) {
    multipleAudios = pageAttr.music.audios;
  } else if (pageAttr.sound?.[0]?.list?.length) {
    // 非多音轨数据，取出第一个模板的音频id作为bgm
    let allTime = 0;
    // eslint-disable-next-line no-restricted-syntax
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

/**
 * @description 获取音频修改状态
 * @param data
 */
export function getAudioEditStatusFromRowData(data: any) {
  const { pageAttr } = data.doc;
  return pageAttr?.music?.replaced;
}
