/* eslint-disable no-template-curly-in-string */
export type GuideActionType =
  | 'asset_unlock' // 元素解锁
  | 'open_audio_list' // 打开音乐列表
  | 'audio_mute' // 音频静音
  | 'recording' // 录音
  | 'layers' // 打开图层
  | 'preview_video' // 预览视频
  | 'background_video_replace' // 替换背景视频
  | 'asset_upload' // 上传图片或视频
  | 'asset_duration_controller' // 调整元素时长
  | 'video_split' // 片段分割
  | 'asset_video_volume_controller' // 视频音量
  | 'AIDubbing' // 配音
  | '';

interface GuideItem {
  actionType: GuideActionType; // 问题类型
  target?: any; // 绑定元素
  title: string; // 问题标题
  describe: string; // 问题描述
}

export const guide: GuideItem[] = [
  {
    actionType: 'asset_duration_controller',
    title: '我想调整部分图片和文字的出现时长。',
    describe: '${click}将自动为您显示时长调整面板。',
  },

  {
    // actionType: 'asset_unlock',
    actionType: 'layers',
    title: '我想编辑背景视频上的某些元素，但编辑不了。',
    describe:
      '${click}将自动为您打开图层列表，您可在图层列表中找到您想要解锁的元素，点击左侧解锁按钮',
  },
  {
    actionType: 'open_audio_list',
    title: '我想替换音乐。',
    describe: '${click}将自动为您显示背景音乐替换面板，请注意页面左侧。',
  },
  {
    actionType: 'open_audio_list',
    title: '我想添加自己的背景音乐？',
    describe: '${click}将自动为您显示背景音乐替换面板，请注意页面左侧。',
  },
  // {
  //   actionType: 'audio_mute',
  //   title: '我想将背景音乐静音。',
  //   describe: "${click}将自动为您静音背景音乐。",
  // },

  {
    actionType: 'AIDubbing',
    title: '我想使用AI配音。',
    describe: '${click}将自动为您弹出AI配音弹框，请注意。',
  },
  {
    actionType: 'recording',
    title: '我想录音。',
    describe: '${click}将自动为您显示录音面板，请注意页面左侧。',
  },
  {
    actionType: 'layers',
    title: '我想看看视频模板的图层。',
    describe: '${click}将自动为您弹出图层面板，请注意页面的左上方。',
  },
  {
    actionType: 'preview_video',
    title: '我想预览视频。',
    describe: '${click}将自动为您弹出视频预览弹框，请注意。',
  },
  // {
  //   actionType: 'background_video_replace',
  //   title: '我想替换视频背景。',
  //   describe:
  //     '将自动为您解锁和选中视频背景，您可以直接选择替换的背景进行替换。',
  // },
  {
    actionType: 'asset_upload',
    title: '我想上传我自己的图片或视频。',
    describe: '${click}将自动为您显示上传面板，请注意页面左侧。',
  },
  {
    // actionType: 'asset_duration_controller',
    actionType: 'video_split',
    title: '我想调整视频时长。',
    describe: '${click}为您高亮展示分割视频按钮，分割后可删除不需要的片段。',
  },
  {
    actionType: 'video_split',
    title: '我想在一个片段中间插入一段视频。',
    describe:
      '${click}为您高亮展示分割视频按钮，分割后可在2个片段中间插入您想要的视频。',
  },
  {
    actionType: 'asset_video_volume_controller',
    title: '我插入的视频素材为什么没有声音。',
    describe:
      '插入的视频素材我们默认为静音，${click}为您自动显示素材的音量调节窗口，请注意页面上方。',
  },
];
