import { XiuIcon } from '@/components';
import styles from './index.modules.less';
// 保存引导
export const SaveGuide = {
  visible: true,
  title: '保存数据',
  type: 4,
  buttonType: 2,
  buttonText: '知道了',
  desc: '为了避免您修改数据丢失，请及时保存您修改的数据文档',
  popupContainer: '#userSave',
  position: 'bottom',
  offset: [0, 0, 20, 0],
  arrowStyle: {
    transform: 'rotate(111deg)',
    right: 100,
    top: -40,
  },
};
// 新手引导
export const NoviceGuide = [
  // 模板创建引导
  [
    {
      key: 'NoviceGuide00',
      index: 0,
      visible: true,
      title: '选中模板內文字/图片/视频双击修改',
      // src: 'https://www.flexclip.com/app/resource/icon/timeline.webm',
      type: 1,
      buttonType: 2,
      currentStep: 1,
      totalStep: 5,
      buttonText: '学到了',
      desc: '',
      popupContainer: '.xiudodo-canvas',
      position: 'left',
      offset: [0, 0, 0, 300],
      arrowStyle: {
        transform: 'rotate(202deg)',
        right: -30,
      },
      webLog: {
        action_type: 'openTempl',
        step: 1,
      },
    },
    {
      index: 0,
      visible: true,
      title: '选中的元素可设置操作都在这里哦！',
      type: 1,
      buttonType: 2,
      currentStep: 2,
      totalStep: 5,
      buttonText: '学到了',
      desc: '这里是针对不同元素可设置或添加的具体操作，快来试试看吧。',
      popupContainer: '.xiudodo-topBar-content',
      offset: [0, 0, 0, 0],
      position: 'bottom-left',
      arrowStyle: {
        transform: 'rotate(140deg)',
        top: -45,
      },
      webLog: {
        action_type: 'openTempl',
        step: 2,
      },
    },
    {
      index: 0,
      visible: true,
      title: '片段时长调整、片段分割、音乐调整看这里',
      // title: (
      //   <>
      //     <video
      //       src={ossEditorPath('/help/guideMove.mp4')}
      //       style={{ width: '100%', height: 'auto' }}
      //       autoPlay
      //       loop
      //     />
      //   </>
      // ),
      type: 1,
      buttonType: 2,
      currentStep: 3,
      totalStep: 5,
      buttonText: '学到了',
      desc: '拖拽片段、音轨2端可以调整时长，右键可查看更多操作，快来点点吧。',
      popupContainer: '#xiudodo-bottom',
      position: 'top',
      offset: [50, 0, 0, 0],
      arrowStyle: {
        transform: 'rotate(316deg)',
        bottom: -45,
        left: '35%',
      },
      webLog: {
        action_type: 'openTempl',
        step: 3,
      },
    },
    {
      index: 0,
      visible: true,
      title: '模板、文件上传、字体 、音乐等资源库',
      type: 1,
      buttonType: 2,
      currentStep: 4,
      totalStep: 5,
      buttonText: '学到了',
      desc: '侧边为丰富的资源导航库，可根据需求来添加，添加动作可点击、可拖拽。快来体验一下吧。',
      popupContainer: '.xiudodo-aside-menu',
      position: 'right-top',
      offset: [20, 0, 0, 0],
      arrowStyle: {
        transform: 'rotate(73deg)',
        left: -35,
      },
      webLog: {
        action_type: 'openTempl',
        step: 4,
      },
    },
    {
      index: 0,
      visible: true,
      title: '导出视频看看效果吧！',
      type: 1,
      buttonType: 2,
      currentStep: 5,
      totalStep: 5,
      buttonText: '学到了',
      desc: '最后一步，合成导出视频 ，每一次导出都会消耗一次合成次数哦。',
      popupContainer: '#down-load',
      position: 'bottom-right',
      offset: [0, 0, 20, 0],
      arrowStyle: {
        transform: 'rotate(144deg)',
        top: -45,
        right: 59,
      },
      webLog: {
        action_type: 'openTempl',
        step: 5,
      },
    },
  ],
  // 空白创建引导
  [
    {
      index: 1,
      visible: true,
      title: '从模板/片段中直接添加到画布',
      type: 1,
      buttonType: 2,
      currentStep: 1,
      totalStep: 5,
      buttonText: '学到了',
      desc: '模板是完全可以自由编辑修改的，你可以搜索模版直接拖拽或点击添加到画布中间。',
      popupContainer: '.side-panel-wrap',
      position: 'right-top',
      offset: [50, 0, 0, 180],
      arrowStyle: {
        transform: 'rotate(69deg)',
        left: -30,
      },
      webLog: {
        action_type: 'newBlank',
        step: 1,
      },
    },
    {
      index: 1,
      visible: true,
      title: '上传你的图片、视频、音频',
      type: 1,
      buttonType: 2,
      currentStep: 2,
      totalStep: 5,
      buttonText: '学到了',
      desc: '想要上传自己的图片，从这里开始。或者你可以直接拖拽进来。',
      popupContainer: '#left-menu-user-space',
      position: 'right-top',
      arrowStyle: {
        transform: 'rotate(69deg)',
        left: -30,
      },
      webLog: {
        action_type: 'newBlank',
        step: 2,
      },
    },
    {
      index: 1,
      visible: true,
      title: '添加文字从这里开始',
      type: 1,
      buttonType: 2,
      currentStep: 3,
      totalStep: 5,
      buttonText: '学到了',
      desc: '打开文字标签，可以选择添加基础文字或是带颜色样式的综艺花字。',
      popupContainer: '#left-menu-text',
      position: 'right-top',
      arrowStyle: {
        transform: 'rotate(69deg)',
        left: -30,
      },
      webLog: {
        action_type: 'newBlank',
        step: 3,
      },
    },
    {
      index: 1,
      visible: true,
      title: '云端音乐、自定义录音从这里开始',
      type: 1,
      buttonType: 2,
      currentStep: 4,
      totalStep: 5,
      buttonText: '学到了',
      desc: '打开音乐标签，找到自己喜欢的或者上传自己的音乐，直接拖拽或者点击添加到音乐轨道。',
      popupContainer: '#left-menu-music',
      position: 'right-top',
      arrowStyle: {
        transform: 'rotate(69deg)',
        left: -30,
      },
      webLog: {
        action_type: 'newBlank',
        step: 4,
      },
    },
    {
      index: 1,
      visible: true,
      title: '导出视频看看效果吧！',
      type: 1,
      buttonType: 2,
      currentStep: 5,
      totalStep: 5,
      buttonText: '学到了',
      desc: '最后一步，合成导出视频 ，每一次导出都会消耗一次合成次数哦。',
      popupContainer: '#down-load',
      position: 'bottom-right',
      offset: [0, 0, 20, 0],
      arrowStyle: {
        transform: 'rotate(144deg)',
        top: -45,
        right: 59,
      },
      webLog: {
        action_type: 'newBlank',
        step: 5,
      },
    },
  ],
];
// 设置元素出现时长引导
export const TrimDurationGuide = {
  type: 2,
  visible: true,
  title: '单个元素时长调整，调整试试',
  buttonType: 0,
  buttonText: '学到了',
  desc: '拖拽元素两端，可调整元素在本片段出现的位置和时长快来试试。',
  popupContainer: '#bottom_selected_asset',
  position: 'top',
  ignoreBtn: false,
  offset: [-50, 0, 0, 0],
  arrowStyle: {
    transform: 'rotate(312deg)',
    bottom: -45,
  },
  webLog: {
    action_type: 'fucShow',
    trigger: 'trimDurationGuide',
  },
};
// 拖拽图片视频进蒙版引导
export const DragInMaskGuide = {
  type: 2,
  visible: true,
  title: '尝试拖拽图片/视频到画布蒙板',
  buttonType: 0,
  buttonText: '学到了',
  desc: '你可以直接拖拽图片/视频到添加到蒙板上去，看看效果',
  popupContainer: '.upload-content',
  position: 'right',
  ignoreBtn: false,
  arrowStyle: {
    transform: 'rotate(35deg)',
    left: -35,
    top: '30%',
  },
  webLog: {
    action_type: 'fucShow',
    trigger: 'dragInMaskGuide',
  },
};
// 上传引导
export const UploadkGuide = {
  type: 2,
  visible: true,
  title: '上传你的图片、视频、音频',
  buttonType: 0,
  buttonText: '学到了',
  desc: '想要上传自己的图片，从这里开始。或者你可以直接拖拽进来，然后进行替换和添加。',
  popupContainer: '#left-menu-user-space',
  position: 'right-top',
  ignoreBtn: false,
  offset: [120, 120, 120, 120],
  arrowStyle: {
    transform: 'rotate(35deg)',
    left: -35,
    top: '30%',
  },
  webLog: {
    action_type: 'fucShow',
    trigger: 'uploadkGuide',
  },
};
// 图层分割
export const AssetClip = {
  visible: true,
  title: '片段时长调整、片段分割、音乐调整看这里',
  // title: (
  //   <>
  //     <video
  //       src={ossEditorPath('/help/guideMove.mp4')}
  //       style={{ width: '100%', height: 'auto' }}
  //       autoPlay
  //       loop
  //     />
  //   </>
  // ),
  type: 2,
  buttonType: 0,
  buttonText: '学到了',
  desc: '拖拽片段、音轨2端可以调整时长，右键可查看更多操作，快来点点吧。',
  popupContainer: '#xiudodo-bottom',
  position: 'top',
  offset: [50, 0, 0, 0],
  arrowStyle: {
    transform: 'rotate(316deg)',
    bottom: -45,
    left: '35%',
  },
  webLog: {
    action_type: 'fucShow',
    trigger: 'assetClip',
  },
};
