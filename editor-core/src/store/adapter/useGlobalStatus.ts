import { useCreation, useThrottleFn } from 'ahooks';
import {
  AssetClass,
  ShapeType,
  useSetTemplateBackgroundAsset,
} from '@hc/editor-core';
import { useEffect, useState } from 'react';
import { getTemplateInfo } from '@/store/adapter/useTemplateInfo';

import {
  useAppDispatch,
  useAppSelector,
  globalStatusAction,
  store,
} from '@/store';
import { getLocalStorage, setLocalstorageExtendStorage } from '@/utils/single';
import { NoviceGuide, UploadkGuide } from '@/pages/Help/Guide/variable';
import { ResAssets } from '@/typings';
import getUrlProps from '@/utils/urlProps';

function useGetGlobalStatusReducer() {
  const { globalStatus } = useAppSelector(store => ({
    globalStatus: store.globalStatus,
  }));
  return globalStatus;
}

type GlobalStatusType = ReturnType<typeof useGetGlobalStatusReducer>;

function useFactory(key: keyof GlobalStatusType) {
  const dispatch = useAppDispatch();
  const GlobalStatus = useGetGlobalStatusReducer();

  const actionKey = useCreation(() => {
    const firstWord = key.slice(0, 1).toUpperCase();
    const otherWords = key.slice(1);
    return `set${firstWord}${otherWords}` as keyof typeof globalStatusAction;
  }, [key]);
  // console.log(actionKey);
  function handle(flag: boolean) {
    dispatch(globalStatusAction[actionKey](flag));
  }

  function open() {
    handle(true);
  }

  function close() {
    handle(false);
  }

  return { open, close, value: GlobalStatus[key] };
}

export function updateTimeAxisScale(scale: number) {
  store.dispatch(globalStatusAction.setTimeAxisScale(scale));
}

export function useTimeAxisScale() {
  const { timeAxisScale } = useGetGlobalStatusReducer();

  // const dispatch = useAppDispatch();
  // function update(scale: number) {
  //   dispatch(globalStatusAction.setTimeAxisScale(scale));
  // }

  return { value: timeAxisScale, update: updateTimeAxisScale };
}

export function useLayersVisit() {
  return useFactory('layersVisit');
}

export function useVideoVolumeController() {
  return useFactory('videoVolumeController');
}

export function useAiDubbingModal() {
  return useFactory('aiDubbingModal');
}

export function useVideoPreviewModal() {
  return useFactory('videoPreviewModal');
}

export function useRechargeModal() {
  return useFactory('rechargeModal');
}

export function useDownloadPopover() {
  return useFactory('downloadPopover');
}

export function useUpgradeVipGuidance() {
  return useFactory('upgradeVipGuidance');
}

export function useSuperimposedCouponModal() {
  return useFactory('superimposedCouponModal');
}

export function useCapacityToRemindModal() {
  return useFactory('capacityToRemindModal');
}

export function useInviteMembersModal() {
  return useFactory('inviteMembersModal');
}

export function useTeamCountModal() {
  const dispatch = useAppDispatch();
  const { teamCountModal, teamCountType, teamId } = useGetGlobalStatusReducer();
  function bindType(type: string) {
    dispatch(globalStatusAction.setTeamCountType(type));
  }
  function bindTeamId(id: string | number) {
    dispatch(globalStatusAction.setTeamId(id));
  }
  function open(type: string, id: string | number) {
    bindType(type);
    bindTeamId(id);
    dispatch(globalStatusAction.setTeamCountModal(true));
  }

  function close() {
    dispatch(globalStatusAction.setTeamCountModal(false));
  }

  return {
    teamId,
    type: teamCountType,
    visible: teamCountModal,
    open,
    close,
  };
}

export function useDownloadTheTransfiniteModal() {
  return useFactory('downloadTheTransfiniteModal');
}
const downloadWarningButtonType = {
  download: 1,
  openVipRecharge: 2,
  openVipUpgrade: 3,
  openMyDownload: 4,
};

export function useDownloadInfo() {
  const dispatch = useAppDispatch();
  const { downloadInfo } = useGetGlobalStatusReducer();

  function open({
    message,
    description,
    buttonType,
    buttonText,
    pixelType,
    remainingTimes = -1,
  }: {
    message: string;
    description: string;
    buttonType: number;
    buttonText: string;
    pixelType: string;
    remainingTimes?: number;
  }) {
    if (
      [message, description, buttonType, buttonText, pixelType].some(
        item => item === '' || item === undefined || item === null,
      )
    ) {
      throw new Error('useDownloadInfo.open is missing required fields');
    }
    dispatch(
      globalStatusAction.setDownloadInfo({
        visible: true,
        message,
        description,
        buttonType,
        buttonText,
        remainingTimes,
        pixelType,
      }),
    );
  }

  function close() {
    dispatch(
      globalStatusAction.setDownloadInfo({
        visible: false,
        message: '',
        description: '',
        // 1 下载  2 充值vip  3 升级vip
        buttonType: -1,
        buttonText: '',
        // pixelType: '',
        vipType: -1,
        remainingTimes: -1,
      }),
    );
  }

  function setPixelType(type: string) {
    dispatch(
      globalStatusAction.setDownloadInfo({
        pixelType: type,
      }),
    );
  }

  return {
    buttonType: downloadWarningButtonType,
    visible: downloadInfo.visible,
    downloadInfo,
    close,
    open,
    pixelType: downloadInfo.pixelType,
    setPixelType,
    exportType: downloadInfo.exportType,
    setExportType: (type: string) =>
      dispatch(globalStatusAction.setDownloadInfo({ exportType: type })),
  };
}

export function useDownloadProgress() {
  const dispatch = useAppDispatch();
  const { downloadProgress } = useGetGlobalStatusReducer();

  function open(jobId: string) {
    if (!jobId) {
      return false;
    }

    dispatch(globalStatusAction.setDownloadProgress({ jobId, visible: true }));
  }

  function close() {
    dispatch(
      globalStatusAction.setDownloadProgress({ jobId: null, visible: false }),
    );
  }

  return {
    value: downloadProgress.visible,
    jobId: downloadProgress.jobId,
    close,
    open,
  };
}

export function usePaySuccessModal() {
  return useFactory('paySuccessModal');
}

export function useLoginModal() {
  return useFactory('loginModal');
}

export function useVipType() {
  const dispatch = useAppDispatch();
  const { vipType } = useGetGlobalStatusReducer();

  function setVipType(payload: number) {
    if (vipType === payload) {
      return;
    }
    dispatch(globalStatusAction.setVipType(payload));
  }

  return {
    vipType,
    setVipType,
  };
}

export function useUserCheckerStatus() {
  const dispatch = useAppDispatch();

  const { userCheckerStatus } = useGetGlobalStatusReducer();

  function setStatus(payload: Partial<GlobalStatusType['userCheckerStatus']>) {
    if (userCheckerStatus.loginAlert !== payload.loginAlert) {
      dispatch(globalStatusAction.setUserCheckerStatus(payload));
    }
  }

  function showReLogin() {
    setStatus({ reLoginTips: true });
  }
  function closeReLoginTips() {
    setStatus({ reLoginTips: false });
  }

  function showLoginAlert() {
    setStatus({ loginAlert: true });
  }
  function closeLoginAlert() {
    setStatus({ loginAlert: false });
  }
  function openLoginAlert() {
    setStatus({ loginAlert: true });
  }
  function startLoop() {
    setStatus({ loopRun: true });
  }

  function stopLoop() {
    setStatus({ loopRun: false });
  }

  return {
    reLoginTips: userCheckerStatus.reLoginTips,
    loginAlert: userCheckerStatus.loginAlert,
    loopRun: userCheckerStatus.loopRun,
    showLoginAlert,
    closeLoginAlert,
    openLoginAlert,
    startLoop,
    stopLoop,
    showReLogin,
    closeReLoginTips,
  };
}

export function useResetGlobalStatus() {
  const dispatch = useAppDispatch();

  function reset() {
    dispatch(globalStatusAction.init());
  }

  return reset;
}

export function useUserLoginModal() {
  const dispatch = useAppDispatch();
  const { loginModal } = useGetGlobalStatusReducer();

  function showLoginModal() {
    dispatch(globalStatusAction.setLoginModal(true));
  }

  function closeLoginModal() {
    dispatch(globalStatusAction.setLoginModal(false));
  }

  return { loginModal, showLoginModal, closeLoginModal };
}

export function usePartModal() {
  const dispatch = useAppDispatch();
  const { partModal } = useGetGlobalStatusReducer();

  const changePartModal = (info: {}) => {
    dispatch(globalStatusAction.setPartModal(info));
  };

  return { partModal, changePartModal };
}

export function useTimelineMode() {
  const dispatch = useAppDispatch();
  const { timeLinePartKey } = useGetGlobalStatusReducer();

  const setTimeLinePartKey = (key: null | number) => {
    dispatch(globalStatusAction.setTimeLinePartKey(key));
  };

  return { timeLinePartKey, setTimeLinePartKey };
}

export function getEditMode() {
  return store.getState().globalStatus.editMode;
}

export function useEditMode() {
  const dispatch = useAppDispatch();
  const { editMode } = useGetGlobalStatusReducer();

  const setEditMode = (status: 'concise' | 'professional') => {
    dispatch(globalStatusAction.setEditMode(status));
  };

  const isConcise = editMode === 'concise';

  return { editMode, setEditMode, isConcise };
}

export function useAddSvgType() {
  const dispatch = useAppDispatch();
  const { addSvgType: v } = useGetGlobalStatusReducer();
  const addSvgType = v as ShapeType | null;

  const setAddSvgType = (status: ShapeType | null) => {
    dispatch(globalStatusAction.setAddSvgType(status));
  };

  return { addSvgType, setAddSvgType };
}

export function useDropdownVisible() {
  const dispatch = useAppDispatch();
  const { dropdownVisible } = useGetGlobalStatusReducer();

  const setDropdownVisible = (visible: boolean) => {
    dispatch(globalStatusAction.setDropdownVisible(visible));
  };

  return { dropdownVisible, setDropdownVisible };
}

export function useLeftSideInfo() {
  const dispatch = useAppDispatch();

  const { leftSideInfo } = useGetGlobalStatusReducer();

  function openSidePanel(payload?: {
    menu?: string;
    submenu?: string;
    modal?: string;
    params?: any;
  }) {
    const {
      menu,
      submenu = '',
      modal = '',
      params = undefined,
    } = payload ?? {};
    dispatch(
      globalStatusAction.setLeftSideInfo({
        sidePanelVisible: true,
        menu: menu || leftSideInfo.menu || 'template',
        submenu,
        params,
        modal,
      }),
    );
  }
  function closeSidePanel() {
    dispatch(
      globalStatusAction.setLeftSideInfo({
        ...leftSideInfo,
        sidePanelVisible: false,
      }),
    );
  }

  function setParams(params: any) {
    dispatch(globalStatusAction.setLeftSideInfoParams(params));
  }
  return {
    leftSideInfo,
    openSidePanel,
    closeSidePanel,
    setParams,
  };
}
export function openSidePanelInfo(payload?: {
  menu?: string;
  submenu?: string;
  modal?: string;
  params?: any;
}) {
  const { menu, submenu = '', modal = '', params = undefined } = payload ?? {};
  store.dispatch(
    globalStatusAction.setLeftSideInfo({
      sidePanelVisible: true,
      menu:
        menu || store.getState().globalStatus.leftSideInfo.menu || 'template',
      submenu,
      params,
      modal,
    }),
  );
}

export function getSidePanelInfo() {
  return store.getState().globalStatus.leftSideInfo;
}

export function closeSubMenu() {
  store.dispatch(globalStatusAction.setLeftSubmenu(''));
}

export function userSaveTime() {
  const { userSaveTime } = useGetGlobalStatusReducer();
  return userSaveTime;
}

export function useUserSave() {
  const dispatch = useAppDispatch();
  const { userSaveStat } = useAppSelector(state => state.globalStatus);

  const updateStat = (stat: number, delay?: number) => {
    // delay  延迟loading 防止闪烁
    if (delay) {
      setTimeout(() => {
        dispatch(globalStatusAction.setUserSaveStat(stat));
      }, delay);
    } else {
      dispatch(globalStatusAction.setUserSaveStat(stat));
    }
  };

  return {
    stat: userSaveStat,
    updateStat,
  };
}

// 新手引导内容
export function getGuideInfo() {
  return store.getState().globalStatus.guideInfo;
}
export function openGuide(payload) {
  store.dispatch(
    globalStatusAction.setGuidePopover({ visible: true, ...payload }),
  );
}
export function useGuideInfo() {
  const dispatch = useAppDispatch();
  const { guideInfo } = useGetGlobalStatusReducer();

  function next() {
    dispatch(
      globalStatusAction.setGuidePopover({
        currentStep: guideInfo.currentStep + 1,
      }),
    );
  }

  function open(payload) {
    // 关闭新手引导
    dispatch(globalStatusAction.setGuidePopover({ visible: true, ...payload }));
  }

  function close() {
    dispatch(
      globalStatusAction.setGuidePopover({
        visible: false,
        desc: '',
        buttonType: -1,
        buttonText: '',
        popupContainer: '',
      }),
    );
  }

  return {
    guideInfo,
    close,
    open,
    next,
  };
}

export function useAudioSetModal() {
  const dispatch = useAppDispatch();
  const { audioSetModal } = useGetGlobalStatusReducer();
  function open() {
    dispatch(globalStatusAction.setAudioSetModal(true));
  }

  function close() {
    dispatch(globalStatusAction.setAudioSetModal(false));
  }

  return {
    visible: audioSetModal,
    open,
    close,
  };
}

export function useTextWatermarkPopover() {
  const localstorage = getLocalStorage('guide') || {};

  const dispatch = useAppDispatch();
  const { textWatermarkPopover } = useGetGlobalStatusReducer();
  function close() {
    setLocalstorageExtendStorage('guide', { ...localstorage, visible: false });
    dispatch(globalStatusAction.setTextWatermarkPopover(false));
  }

  const visible = localstorage.visible !== false;
  return {
    visible,
    close,
  };
}

export function useShareModal() {
  const dispatch = useAppDispatch();
  const { shareModal, isAllowShare } = useGetGlobalStatusReducer();
  function open() {
    dispatch(globalStatusAction.setShareModal(true));
  }
  function setIsAllowShare(value: boolean) {
    dispatch(globalStatusAction.setIsAllowShare(value));
  }
  function close() {
    dispatch(globalStatusAction.setShareModal(false));
    setIsAllowShare(true);
  }

  return {
    visible: shareModal,
    open,
    close,
    isAllowShare,
    setIsAllowShare,
  };
}

export function useMoreMenu() {
  const dispatch = useAppDispatch();

  const { moreMenu } = useGetGlobalStatusReducer();
  function updateMoreMenu(activeMoreMenu: any) {
    dispatch(globalStatusAction.setMoreMenu({ activeMoreMenu }));
  }

  return {
    moreMenu,
    updateMoreMenu,
  };
}

export function useReferenceLine() {
  const dispatch = useAppDispatch();

  const { referenceLineX, referenceLineY, referenceLineShow } =
    useGetGlobalStatusReducer();
  function updateReferenceLine(arr: Array<object>, type: string) {
    if (type === 'x') {
      if (getTemplateInfo()?.templates[0]?.template?.templateId) {
        window.localStorage.setItem(
          `referenceLineX${
            getTemplateInfo()?.templates[0]?.template?.templateId
          }`,
          JSON.stringify(arr),
        );
      }
      dispatch(globalStatusAction.setReferenceLineX(arr));
    } else {
      if (getTemplateInfo()?.templates[0]?.template?.templateId) {
        window.localStorage.setItem(
          `referenceLineY${
            getTemplateInfo()?.templates[0]?.template?.templateId
          }`,
          JSON.stringify(arr),
        );
      }
      dispatch(globalStatusAction.setReferenceLineY(arr));
    }
  }
  function updateReferenceLineShow(bol: boolean) {
    if (getTemplateInfo()?.templates[0]?.template?.templateId) {
      window.localStorage.setItem(
        `referenceLineShow${
          getTemplateInfo()?.templates[0]?.template?.templateId
        }`,
        JSON.stringify(bol),
      );
    }
    dispatch(globalStatusAction.setReferenceLineShow(bol));
  }

  return {
    referenceLineX,
    referenceLineY,
    referenceLineShow,
    updateReferenceLine,
    updateReferenceLineShow,
  };
}

export function useDesignerReferenceLine() {
  const dispatch = useAppDispatch();
  const { upicId } = getUrlProps();

  const { show, XLine, YLine } = useGetGlobalStatusReducer();
  function updateLine(arr: Array<object>, type: string) {
    if (type === 'x') {
      if (upicId) {
        window.localStorage.setItem(`xLine${upicId}`, JSON.stringify(arr));
      }
      dispatch(globalStatusAction.setXLine(arr));
    } else {
      if (upicId) {
        window.localStorage.setItem(`yLine${upicId}`, JSON.stringify(arr));
      }
      dispatch(globalStatusAction.setYLine(arr));
    }
  }
  function _show(bol: boolean) {
    if (upicId) {
      window.localStorage.setItem(`show${upicId}`, JSON.stringify(bol));
    }
    dispatch(globalStatusAction.setShow(bol));
  }

  return {
    XLine,
    YLine,
    show,
    updateLine,
    _show,
  };
}

type ModeType = 'timeline' | 'simple';

export function setBottomMode(mode: ModeType) {
  store.dispatch(globalStatusAction.setBottomMode(mode));
}

export function useBottomMode() {
  const { bottomMode } = useGetGlobalStatusReducer();
  return {
    value: bottomMode,
    setBottomMode,
  };
}

export function useBackgroundControl() {
  const { backgroundInClipping } = useGetGlobalStatusReducer();
  const dispatch = useAppDispatch();

  function endCliping() {
    dispatch(globalStatusAction.setBackgroundControl(false));
  }

  function startCliping() {
    dispatch(globalStatusAction.setBackgroundControl(true));
  }

  return {
    backgroundControl: {
      inClipping: backgroundInClipping,
    },
    startCliping,
    endCliping,
  };
}

export function useSettingPanelInfo() {
  const dispatch = useAppDispatch();
  const { settingPanel } = useGetGlobalStatusReducer();

  function open(panelKey: string, params?: any) {
    dispatch(
      globalStatusAction.setSettingPanelInfo({
        visible: true,
        panelKey,
        params,
      }),
    );
  }

  function close() {
    dispatch(
      globalStatusAction.setSettingPanelInfo({
        visible: false,
        panelKey: '',
        params: {},
      }),
    );
  }

  function setParams(params: any) {
    dispatch(
      globalStatusAction.setSettingPanelInfo({
        visible: true,
        panelKey: settingPanel.panelKey,
        params,
      }),
    );
  }

  return {
    open,
    close,
    value: settingPanel,
    setParams,
  };
}

export function useAssetReplaceModal() {
  const dispatch = useAppDispatch();
  const { assetReplaceModal } = useGetGlobalStatusReducer();
  const { open: openGuide } = useGuideInfo();
  const { openSidePanel } = useLeftSideInfo();

  function open(type: string) {
    const payload: {
      visible: boolean;
      type: string;
    } = { visible: true, type };

    dispatch(globalStatusAction.setAssetReplaceModal(payload));
  }
  function close() {
    dispatch(
      globalStatusAction.setAssetReplaceModal({
        visible: false,
        type: '',
        selectedList: [],
        replaceIngAsset: undefined,
      }),
    );
    // 如果是新手，打开新手引导
    const { uploadkGuide } = getLocalStorage('guide');
    if (!uploadkGuide) {
      openSidePanel({ menu: 'user-space' });
      setTimeout(() => {
        openGuide(UploadkGuide);
        setLocalstorageExtendStorage('guide', { uploadkGuide: true });
      }, 300);
    }
  }

  function updateSelectedList(list: any[]) {
    dispatch(
      globalStatusAction.setAssetReplaceModal({
        selectedList: list,
      }),
    );
  }

  function setPlayId(id: string | undefined) {
    dispatch(
      globalStatusAction.setAssetReplaceModal({
        playId: id,
      }),
    );
  }
  function updateReplaceIngAsset(assetId: number) {
    dispatch(
      globalStatusAction.setAssetReplaceModal({
        replaceIngAsset: assetId,
      }),
    );
  }

  return {
    value: assetReplaceModal,
    updateSelectedList,
    open,
    setPlayId,
    close,
    updateReplaceIngAsset,
  };
}

export function getSettingPanel() {
  return store.getState().globalStatus.settingPanel;
}

export function showBindPhoneModal() {
  store.dispatch(globalStatusAction.setBindPhoneModal(true));
}

export function useUserBindPhoneModal() {
  const dispatch = useAppDispatch();
  const { bindPhoneModal } = useGetGlobalStatusReducer();

  function closeBindPhoneModal() {
    dispatch(globalStatusAction.setBindPhoneModal(false));
  }

  return { bindPhoneModal, showBindPhoneModal, closeBindPhoneModal };
}

export function useQrCodeEditModal(): [boolean, typeof _qrCodeEditModal] {
  const dispatch = useAppDispatch();
  const { qrCodeEditModal } = useGetGlobalStatusReducer();

  function _qrCodeEditModal(visible: boolean) {
    dispatch(globalStatusAction.setQrCodeEditModal(visible));
  }

  return [qrCodeEditModal, _qrCodeEditModal];
}

export function usePasteStatus() {
  const dispatch = useAppDispatch();
  const { pasteStatus } = useGetGlobalStatusReducer();

  function setPasteStatus(status: {}) {
    dispatch(globalStatusAction.setPasteStatus(status));
  }
  return { pasteStatus, setPasteStatus };
}

export function usePasteModal() {
  const dispatch = useAppDispatch();
  const { pasteModal } = useGetGlobalStatusReducer();
  function open() {
    dispatch(globalStatusAction.setPasteModal(true));
  }

  function close() {
    dispatch(globalStatusAction.setPasteModal(false));
  }

  return {
    visible: pasteModal,
    open,
    close,
  };
}

export function useIconfontStatus() {
  return useFactory('iconfontLoaded');
}

export function useIconpartStatus() {
  return useFactory('iconparkLoaded');
}

export function setIconpartStatus(loaded: boolean) {
  return store.dispatch(globalStatusAction.setIconparkLoaded(loaded));
}
export function setIconfontStatus(loaded: boolean) {
  return store.dispatch(globalStatusAction.setIconfontLoaded(loaded));
}

export function useActiveBrand() {
  const dispatch = useAppDispatch();
  const { activeBrand } = useGetGlobalStatusReducer();

  function updateActiveBrand(activeBaran: any) {
    dispatch(globalStatusAction.setActiveBrand(activeBaran));
  }
  return { activeBrand, updateActiveBrand };
}
export function setManualScale(loaded: boolean) {
  return store.dispatch(globalStatusAction.setManualScale(loaded));
}
export function getManualScale() {
  return store.getState().globalStatus.manualScale;
}
export function useOneKeyReplace() {
  const openCloseOneKeyReplace = (flag: boolean) => {
    return store.dispatch(globalStatusAction.setOneKeyReplace(flag));
  };
  return {
    openCloseOneKeyReplace,
    isOneKeyReplace: store.getState().globalStatus.oneKeyReplace,
  };
}
