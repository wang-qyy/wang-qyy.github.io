import { getDefaultEditMode } from '@/utils/common';
import { createSlice } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';

export function getInitData() {
  return {
    bottomMode: 'timeline', // timeline-时间轴模式、simple-简单模式
    timeAxisScale: 100,
    paySuccessModal: false, // 支付成功弹框
    superimposedCouponModal: false, // 支付成功弹框
    downloadPopover: false, // 下载popover
    rechargeModal: false, // 充值弹框
    teamCountModal: false, // 团队下载次数弹框
    teamCountType: '', // 下载次数用完or无下载机会
    loginModal: false, // 登录弹框
    bindPhoneModal: false, // 用户绑定手机弹窗
    qrCodeEditModal: false,
    // 新增片段弹框
    partModal: {
      visible: false,
      currentIndex: 0,
    },
    timeLinePartKey: null, // 时间线模式
    addSvgType: null, // 'rect' | 'ellipse' | 'triangle' | 'path' 添加元素
    editMode: getDefaultEditMode(), // 编辑模式， concise | professional 极速模式 | 专业模式
    dropdownVisible: false, // 右键菜单
    shareModal: false, // 拉新链接弹框
    isAllowShare: true, // 关闭充值弹框的时候是否显示拉新
    userInfoGetterLoop: false,
    userSaveStat: 0, // 0-未保存 1-保存中 2-已保存 3-已自动为您保存 4-更改未保存 5-保存失败 6-http响应错误（eg:保存超时）
    userSaveTime: 0, // 保存时间
    layersVisit: false, // 图层浮窗
    videoVolumeController: false, // 视频音量调节
    aiDubbingModal: false, // AI配音弹框
    audioSetModal: false,
    textWatermarkPopover: true,
    videoPreviewModal: false,
    inviteMembersModal: false, // 邀请加入团队弹框
    capacityToRemindModal: false,
    downloadTheTransfiniteModal: false,
    teamId: '',
    guideInfo: {
      key: '',
      index: 0,
      visible: false,
      type: -1, // 1-新手引导，2-时长设置引导，3-工具栏引导 4-保存提示
      title: undefined,
      desc: undefined,
      buttonType: -1, // 0-关闭（知道了） 1-下一步 2-设置时长 3-打开注册登录
      buttonText: '',
      popupContainer: '',
      placement: '',
      ignoreBtn: false,
      currentStep: -1,
      totalStep: 1,
      position: '',
      offset: [0, 0, 0, 0], // 上、右、下、左
      arrowStyle: {},
      src: undefined,
      webLog: undefined,
    },

    downloadProgress: {
      visible: false,
      jobId: null,
    },
    downloadInfo: {
      visible: false,
      message: '',
      description: '',
      // 1 下载  2 充值vip  3 升级vip
      buttonType: -1,
      buttonText: '',
      exportType: 'mp4',
      pixelType: '480P',
      remainingTimes: -1,
    },
    upgradeVipGuidance: false,
    vipType: -1,
    userCheckerStatus: {
      loopRun: true,
      isLogin: false,
      loginAlert: false, // 登录提示
      reLoginTips: false, // 重新登录
    },
    leftSideInfo: {
      sidePanelVisible: false,
      menu: '', // 左侧菜单
      submenu: '', // 子菜单
      params: {},
    },
    settingPanel: {
      // 左侧设置面板
      visible: false,
      panelKey: '',
      params: {},
    },
    activeBrand: null, // 当前选中品牌
    moreMenu: null, // 更多menu
    referenceLineX: [], // 参考线x轴
    referenceLineY: [], // 参考线Y轴
    referenceLineShow: false, // 参考线和标尺是否显示

    show: false, // 设计师参考线和标尺是否显示
    XLine: [], // 设计师参考线x轴
    YLine: [], // 设计师参考线Y轴
    backgroundInClipping: false,
    assetReplaceModal: {
      // 元素替换弹框
      visible: false,
      type: '', // replace-batch 一键替换； replace-audio 替换音频；
      selectedList: [],
      playId: undefined,
      replaceIngAsset: undefined, // 正在替换的图层
    },

    pasteStatus: -1, // -1:默认值 1:上传中 2:上传成功

    // 粘贴提示弹窗
    pasteModal: false,

    iconfontLoaded: false,
    iconparkLoaded: false,

    manualScale: false, // 是否手动改变了画布的缩放值

    oneKeyReplace: false, // 是否开启一键替换状态
  };
}

export const counterSlice = createSlice({
  name: 'globalStatus',
  initialState: getInitData(),
  reducers: {
    setTimeAxisScale: (state, action) => {
      state.timeAxisScale = action.payload;
    },

    setRechargeModal: (state, action) => {
      state.rechargeModal = action.payload;
    },

    setVipType: (state, action) => {
      state.vipType = action.payload;
    },
    setDownloadProgress: (state, action) => {
      Object.assign(state.downloadProgress, action.payload);
    },
    setDownloadPopover: (state, action) => {
      state.downloadPopover = action.payload;
    },
    setPaySuccessModal: (state, action) => {
      state.paySuccessModal = action.payload;
    },
    setSuperimposedCouponModal: (state, action) => {
      state.superimposedCouponModal = action.payload;
    },
    setVideoPreviewModal: (state, action) => {
      state.videoPreviewModal = action.payload;
    },
    setLoginModal: (state, action) => {
      state.loginModal = action.payload;
    },
    setBindPhoneModal: (state, action) => {
      state.bindPhoneModal = action.payload;
    },
    setQrCodeEditModal: (state, action) => {
      state.qrCodeEditModal = action.payload;
    },
    setPartModal: (state, action) => {
      Object.assign(state.partModal, action.payload);
    },
    setTimeLinePartKey: (state, action) => {
      state.timeLinePartKey = action.payload;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    setAddSvgType: (state, action) => {
      state.addSvgType = action.payload;
    },
    setDropdownVisible: (state, action) => {
      state.dropdownVisible = action.payload;
    },
    setUpgradeVipGuidance: (state, action) => {
      state.upgradeVipGuidance = action.payload;
    },
    setUserInfoGetterLoop: (state, action) => {
      state.userInfoGetterLoop = action.payload;
    },
    setUserCheckerStatus: (state, action) => {
      Object.assign(state.userCheckerStatus, action.payload);
    },
    setDownloadInfo: (state, action) => {
      Object.assign(state.downloadInfo, action.payload);
    },
    setLeftSideInfo: (state, action) => {
      if (!isEqual(state.leftSideInfo, action.payload)) {
        state.leftSideInfo = action.payload;
      }
    },
    setLeftSideInfoParams(state, action) {
      Object.assign(state.leftSideInfo, { params: action.payload });
    },
    setLeftSubmenu: (state, action) => {
      state.leftSideInfo.submenu = action.payload;
    },
    setUserSaveStat: (state, action) => {
      // Object.assign(state.userSave,);
      state.userSaveStat = action.payload;
    },
    setUserSaveTime: (state, action) => {
      state.userSaveTime = action.payload;
    },
    setGuidePopover: (state, action) => {
      state.guideInfo = action.payload;
    },

    setAudioSetModal: (state, action) => {
      state.audioSetModal = action.payload;
    },
    setShareModal: (state, action) => {
      state.shareModal = action.payload;
    },
    setTextWatermarkPopover: (state, action) => {
      state.textWatermarkPopover = action.payload;
    },

    setIsAllowShare: (state, action) => {
      state.isAllowShare = action.payload;
    },
    setCapacityToRemindModal: (state, action) => {
      state.capacityToRemindModal = action.payload;
    },
    setDownloadTheTransfiniteModal: (state, action) => {
      state.downloadTheTransfiniteModal = action.payload;
    },
    setTeamCountModal: (state, action) => {
      state.teamCountModal = action.payload;
    },
    setTeamCountType: (state, action) => {
      state.teamCountType = action.payload;
    },
    setTeamId: (state, action) => {
      state.teamId = action.payload;
    },
    setInviteMembersModal: (state, action) => {
      state.inviteMembersModal = action.payload;
    },
    setLayersVisit(state, action) {
      state.layersVisit = action.payload;
    },
    setVideoVolumeController(state, action) {
      state.videoVolumeController = action.payload;
    },
    setAiDubbingModal(state, action) {
      state.aiDubbingModal = action.payload;
    },
    setMoreMenu: (state, action) => {
      state.moreMenu = action.payload?.activeMoreMenu;
    },

    setReferenceLineX: (state, action) => {
      state.referenceLineX = action.payload;
    },
    setReferenceLineY: (state, action) => {
      state.referenceLineY = action.payload;
    },
    setReferenceLineShow: (state, action) => {
      state.referenceLineShow = action.payload;
    },
    setXLine: (state, action) => {
      state.XLine = action.payload;
    },
    setYLine: (state, action) => {
      state.YLine = action.payload;
    },
    setShow: (state, action) => {
      state.show = action.payload;
    },
    setBottomMode(state, action) {
      state.bottomMode = action.payload;
    },
    setBackgroundControl(state, action) {
      state.backgroundInClipping = action.payload;
    },
    setSettingPanelInfo(state, action) {
      state.settingPanel = action.payload;
    },
    setAssetReplaceModal(state, action) {
      // state.assetReplaceModal = action.payload;
      Object.assign(state.assetReplaceModal, action.payload);
    },

    setPasteStatus(state, action) {
      state.pasteStatus = action.payload;
    },
    setPasteModal(state, action) {
      state.pasteModal = action.payload;
    },

    setIconfontLoaded(state, action) {
      state.iconfontLoaded = action.payload;
    },
    setIconparkLoaded(state, action) {
      state.iconparkLoaded = action.payload;
    },
    setActiveBrand: (state, action) => {
      state.activeBrand = action.payload;
    },
    setManualScale: (state, action) => {
      state.manualScale = action.payload;
    },
    setOneKeyReplace: (state, action) => {
      state.oneKeyReplace = action.payload;
    },
    init: () => {
      return getInitData();
    },
  },
});
const globalStatusReducer = counterSlice.reducer;
const globalStatusAction = counterSlice.actions;
export { globalStatusReducer, globalStatusAction };
