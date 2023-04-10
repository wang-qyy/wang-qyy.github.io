import {
  RawTemplateData,
  Assets,
  toJS,
  Audio,
  BaseMultipleAudio,
  MultipleAudio,
  getAllAudios,
  getAudioEditStatus,
} from '@hc/editor-core';

import getUrlParams from '@/utils/urlProps';

export function getPoster(assets: Assets = []) {
  // console.log(toJS(assets));
  return assets.find(item => item.meta.type === 'videoE');
}

// 将原始接口获取的模板信息，转换成可用的数据
export function formatRawData(data: any) {
  const { doc, info } = data;
  const { work, pageAttr, canvas, widgets } = doc;
  // [
  //   {
  //     width: 832.7314886491831,
  //     height: 468.41146236516556,
  //     startTime: 500,
  //     endTime: 1000,
  //     posX: 3.8104493347987045,
  //     posY: 4,
  //     easing: 'linear',
  //     scale: 2.305665182800438,
  //   },
  //   {
  //     width: 831.5488391009208,
  //     height: 467.7462219942679,
  //     startTime: 1500,
  //     endTime: 2000,
  //     posX: 1084.4511608990792,
  //     posY: -2,
  //     easing: 'linear',
  //     scale: 2.308944357466633,
  //   },
  //   {
  //     width: 696.0326060782178,
  //     height: 391.5183409189975,
  //     startTime: 2500,
  //     endTime: 3000,
  //     posX: 1221.9673939217823,
  //     posY: 682.4816590810025,
  //     easing: 'linear',
  //     scale: 2.7584914603616095,
  //   },
  //   {
  //     width: 727.1865543768454,
  //     height: 409.04243683697564,
  //     startTime: 3500,
  //     endTime: 4000,
  //     posX: 4,
  //     posY: 670.9575631630244,
  //     easing: 'linear',
  //     scale: 2.6403128446803077,
  //   },
  // ]
  const newData: RawTemplateData[] = [];
  work.forEach((item: Assets, index: number) => {
    const pageInfo = pageAttr.pageInfo[index];
    let aqe;

    if (Array.isArray(pageAttr.aqe)) {
      aqe = pageAttr.aqe[index];
    }

    // totalPageTime += pageAttr.pageInfo.pageTime;

    newData.push({
      canvas: { ...canvas, title: info.title },
      assets: item,
      templateId:
        work.length === 1
          ? pageAttr.pageInfo[index].tid ?? info.last_templ_id ?? info.id
          : pageAttr.pageInfo[index].tid ?? '',
      poster: pageInfo.rt_preview_image,
      preview: pageInfo.rt_preview_video,
      preview_url: info.preview_url || '',
      small_url: info.small_url || '',
      pageAttr: {
        backgroundColor: pageAttr.backgroundColor[index],
        backgroundImage: pageAttr.backgroundImage[index],
        pageInfo,
        sound: { list: [] },
        // sound: pageAttr.sound[index] || {
        //   list: [],
        // },
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

  const { redirect } = getUrlParams();

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
        replaced: redirect ? replaced : false,
      },
      aqe: [],
    },
    widgets: [],
  };

  data.forEach(item => {
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
