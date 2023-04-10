import { getMusicList } from '@/api/music';
import { assetListEle, assetList } from '@/api/pictures';
import { getVideoE } from '@/api/videoE';
import { formatFrameToTime } from '@/utils/single';

export const filters = {
  image: [
    {
      key: 'kid',
      label: '分类',
      options: [
        { value: '20,2,66', label: '全部' },
        { value: '2', label: '创意背景' },
        { value: '66', label: '插画' },
        { value: '20', label: '照片' },
      ],
    },
    {
      key: 'isPortrait',
      label: '人像',
      type: 'radio',
      options: [
        { value: 'all', label: '全部' },
        { value: '1', label: '有' },
        { value: '0', label: '无' },
      ],
    },
  ],
  videoE: [
    {
      key: 'ratio',
      label: '视频比例',
      type: 'radio',
      options: [
        { value: 'w', label: '16:9' },
        { value: 'h', label: '9:16' },
        { value: 'c', label: '1:1' },
      ],
    },
  ],

  element: [
    {
      key: 'search_type',
      label: '类型',
      type: 'radio',
      options: [
        { value: 'image', label: '图片' },
        { value: 'gif', label: 'GIF动图' },
        { value: 'lottie', label: '动画' },
      ],
    },
  ],
};

export const config = {
  image: {
    request: assetList,
    formatResult: (res: any) => ({
      list: res.data.list,
      pageTotal: res.data.total,
    }),
    getAttribute: (params: any) => {
      const picUrl = params.host + params.sample;
      return {
        picUrl,
        rt_preview_url: picUrl,
      };
    },
    defaultFiltered: { kid: '20,2,66', isPortrait: 'all' },
  },
  videoE: {
    request: getVideoE,
    getAttribute: (params: any) => ({
      rt_total_time: params.duration,
      rt_frame_url: params.frame_file,
      rt_total_frame: params.total_frame,
      rt_url: params.sample,
      rt_preview_url: params.preview,
    }),
    defaultFiltered: { ratio: 'w' },
  },
  element: {
    request: assetListEle,
    getAttribute: (params: any) => ({
      picUrl: params.sample,
      rt_preview_url: params.preview,
      rt_url: params.sample,
      rt_total_time:
        params.asset_type === 'lottie'
          ? formatFrameToTime(params.total_frame)
          : params.duration,
      rt_frame_url: params.frame_file,
      rt_frame_file: params.frame_file,
      rt_total_frame: params.total_frame,
      source_key: params.source_key,
    }),
    defaultFiltered: { search_type: 'image' },
  },
  audio: {
    request: getMusicList,
    formatResult: (res: any) => ({
      list: res.data.list,
      pageTotal: res.data.total,
    }),
    getAttribute: (params: any) => {
      console.log('params', params);
      
      return {
        // picUrl: params.sample,
        // rt_preview_url: params.preview,
        // rt_url: params.sample,
        // rt_total_time:
        //   params.asset_type === 'lottie'
        //     ? formatFrameToTime(params.total_frame)
        //     : params.duration,
        // rt_frame_url: params.frame_file,
        // rt_frame_file: params.frame_file,
        // rt_total_frame: params.total_frame,
        // source_key: params.source_key,
      };
    },
    defaultFiltered: { search_type: 'audio' },
  },
};
