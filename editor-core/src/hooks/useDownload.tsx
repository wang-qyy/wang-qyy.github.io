import { useMemo } from 'react';
import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';

import XiuIcon from '@/components/XiuIcon';

import { applyExport, downloadInfo as getDownloadInfo } from '@/api/pub';
import {
  useRechargeModal,
  useDownloadPopover,
  useDownloadInfo,
  useDownloadTheTransfiniteModal,
  useTeamCountModal,
} from '@/store/adapter/useGlobalStatus';
import urlProps from '@/utils/urlProps';
import { windowBeforeUnload } from '@/utils/single';
import { handleSave } from '@/utils/userSave';
import { downloadLimit, dataTeam } from '@/utils/webLog';
import { useCouponStatus } from '@/store/adapter/useCouponStatus';

import { useGetDownloadInfo } from '@/store/adapter/useUserInfo';

import { useCheckLoginStatus } from '@/hooks/loginChecker';

import { WarnModal } from '@/components/WarnModal';

const isProd = process.env.NODE_ENV === 'production';

interface DataParams {
  dln_value: number;
  vip_type: number;
  vip_value: number;
  today_dln_value: number;
  today_vip_dln_value: number;
}
function getDataWithMock(data: DataParams, needMock: boolean) {
  const mockData = {
    vip_type: 1,
    dln_value: 1,
    vip_value: 1,
    today_dln_value: 1,
    today_vip_dln_value: 0,
  };
  // 当不是生产环境并且需要mock数据时，可以返回mock数据，生产环境必须返回mock
  if (needMock && !isProd) {
    return mockData;
  }
  return { ...data };
}

// 判断会员总下载次数 显示对应提醒框
const bindWarnModal = (bol: boolean, callback: () => void) => {
  if (bol) {
    return WarnModal({
      title: '您今日下载次数已用完!',
      content: '您可以升级更高版本会员,或明日在来下载吧!',
      button: '升级会员',
      onOk: () => {
        callback();
      },
      onCancel: () => { },
      width: 415,
    });
  }
  return WarnModal({
    title: '当前会员套餐下载次数已用完!',
    content: '继续下载需要重新充值会员套餐',
    button: '立即充值',
    onOk: () => {
      callback();
    },
    onCancel: () => { },
    width: 415,
  });
};

export function useDownload() {
  const RechargeModal = useRechargeModal();
  const { updateCouponStatus } = useCouponStatus();

  const DownloadPopover = useDownloadPopover();
  const DownloadInfo = useDownloadInfo();
  const downloadTheTransfiniteModal = useDownloadTheTransfiniteModal();
  const { downloadInfo } = useGetDownloadInfo();

  const isVip = downloadInfo?.vip_type !== 0;

  const { open } = downloadTheTransfiniteModal;
  const openRechargeModal = () => {
    RechargeModal.open();
    DownloadPopover.close();
  };

  function handleDownload(data: any) {
    const { openMyDownload } = DownloadInfo.buttonType;
    const { err } = data;

    if (err === 'repeated') {
      DownloadInfo.open({
        message: '当前视频已在下载列表!',
        description: '无需重复下载，可在我的视频查看进度',
        buttonType: openMyDownload,
        buttonText: '点击查看',
        pixelType: DownloadInfo.pixelType,
      });
      // return
    }
  }

  const fetchApplyExport = useRequest(applyExport, {
    manual: true,
    onSuccess: (res, params: Array<any>) => {
      if (res.code === 1005) {
        if (res.data?.err === 'memory_limited') {
          open();
        } else if (res.data?.err === 'limited') {
          if (isVip) {
            bindWarnModal(true, () => {
              if (downloadInfo.is_upg && downloadInfo.pkg_count === 1) {
                // VIP下载受限，商用版弹出商用充值弹框，下载版弹出充值提醒弹出
                if ([301, 302, 303].indexOf(downloadInfo.vip_type) > -1) {
                  updateCouponStatus({ tagKey: '10', upgradeMode: true });
                } else {
                  updateCouponStatus({ tagKey: '20', upgradeMode: true });
                }
                RechargeModal.open();
              } else {
                window.open('https://xiudodo.com/myspace/vip');
              }
            });
          } else {
            RechargeModal.open();
          }

          // 下载受限埋点
          downloadLimit({
            vip_type: downloadInfo.vip_type,
            pixel_type: params[0].pixel_type,
            limited_type: params[0].exportType === 'mp4' ? 'dlNum' : 'gifDl',
          });
        } else if (res.data?.err === 'displayNC') {
          params[0]?.callback(res.data?.err);
        } else if (res.data?.err === 'contentBlock') {
          message.error('系统检测当前存在违规嫌疑  无法合成');
        } else {
          handleDownload(res.data);
        }
      } else {
        // 打开下载进度弹窗时，关闭info弹窗

        // openDownloadModal(res.job_id);
        // console.log(res);
        const openUrl = params[0]?.platform
          ? `https://xiudodo.com/myspace/videos?platform=${params[0]?.platform}`
          : `https://xiudodo.com/myspace/videos`;

        windowBeforeUnload.close();
        window.open(openUrl, '_self');
        // window.open(
        //   `https://xiudodo.com/my/export-progress/${res.download_id}`,
        //   '_self',
        // );
        // DownloadInfo.close();

        // 当请求成功返回，再关闭弹窗
        DownloadPopover.close();
      }
    },
  });

  const startDownLoad = (
    format: string,
    pixel_type: any,
    platform: any,
    data: any,
    callback: (data: any) => void,
  ) => {
    const { upicId } = urlProps();
    fetchApplyExport.run({
      id: upicId,
      format,
      pixel_type,
      platform,
      data, // 下载超限验证信息
      callback,
    });
  };
  return {
    startDownLoad,
    openRechargeModal,
    loading: fetchApplyExport.loading,
  };
}

export function useBeforeDownLoad() {
  const { downloadInfo } = useGetDownloadInfo();

  const { pixelType, setPixelType, exportType, setExportType } = useDownloadInfo();

  const DownloadInfo = useDownloadInfo();

  const RechargeModal = useRechargeModal();

  const { updateCouponStatus } = useCouponStatus();

  const DownloadPopover = useDownloadPopover();

  const vipStatus = useMemo(() => {
    const {
      dln_value = 0,
      vip_type = 0,
      vip_value = 0,
      today_dln_value,
      today_vip_dln_value = 0,
    } = getDataWithMock(downloadInfo, false);
    // mock 数据

    const isVip = vip_type !== 0;
    const vipType = vip_type;
    // 剩余次数
    let remainingTimes: any = pixelType === '480P' ? dln_value : vip_value;

    let downloadType = -1;

    if (dln_value === -1) {
      remainingTimes = '海量';
    }

    if (isVip) {
      // vip
      if (today_dln_value === 0 || (vip_value === 0 && pixelType !== '480P')) {
        // 所有下载次数用完  或vip次数用完 选择720p/1080p  打开充值弹框
        downloadType = DownloadInfo.buttonType.openVipRecharge;
      } else if (vip_value === 1) {
        // vip下载次数只剩一次下载提示
        downloadType = DownloadInfo.buttonType.download;
      }
    } else {
      // 非VIP 当日免费次数用完 或选择720p/1080p
      if (today_dln_value === 0 || pixelType !== '480P') {
        downloadType = DownloadInfo.buttonType.openVipRecharge;
      }
    }

    return {
      remainingTimes,
      vipType,
      downloadType,
      isVip,
      today_dln_value,
      today_vip_dln_value,
    };
  }, [downloadInfo, pixelType]);

  const { remainingTimes, downloadType, vipType, isVip } = vipStatus;

  /**
   *  当前业务场景
   *  1 非vip当日下载次数用完 => 触发下载接口，由后端返回是否允许的下载状态
   *  2 vip次数用完 => 触发下载接口，由后端返回是否允许的下载状态
   *  3 vip只剩下一次下载 => 前端判断剩余一次时，弹窗提示用户确认
   *  4 非vip无下载次数 => 前端判断，无下载次||下载非480p视频时，弹窗引导用户至充值页
   */

  const beforeDownLoad = () => {
    const { openVipRecharge, download, openVipUpgrade } =
      DownloadInfo.buttonType;
    // console.log(downloadType);
    switch (downloadType) {
      case -1:
        // Download.startDownLoad(pixelType);
        DownloadPopover.open();
        break;
      case openVipRecharge:
        if (isVip) {
          bindWarnModal(true, () => {
            if (downloadInfo.is_upg && downloadInfo.pkg_count === 1) {
              // VIP下载受限，商用版弹出商用充值弹框，下载版弹出充值提醒弹出
              if ([301, 302, 303].indexOf(downloadInfo.vip_type) > -1) {
                updateCouponStatus({ tagKey: '10', upgradeMode: true });
              } else {
                updateCouponStatus({ tagKey: '20', upgradeMode: true });
              }
              RechargeModal.open();
            } else {
              window.open('https://xiudodo.com/myspace/vip');
            }
          });
        } else {
          // 充值
          RechargeModal.open();
        }
        // 下载受限埋点
        downloadLimit({
          vip_type: downloadInfo.vip_type,
          pixel_type: pixelType,
          limited_type: exportType === 'mp4' ? 'dlNum' : 'gifDl',
        });
        break;
      case download:
        DownloadInfo.open({
          message: '当前剩余下载次数：',
          description: '确定下载吗？',
          buttonType: downloadType,
          buttonText: '确定下载',
          pixelType,
          remainingTimes,
        });

        break;
      case openVipUpgrade:
        DownloadInfo.open({
          message: '当前下载权益已用完！',
          description: '可补差价升级权益继续下载视频',
          buttonType: openVipUpgrade,
          buttonText: '升级VIP',
          pixelType: '480px',
        });
        downloadLimit({
          vip_type: vipType,
          pixel_type: pixelType,
          limited_type: exportType === 'mp4' ? 'dlNum' : 'gifDl',
        });
        break;
      default:
    }
  };
  return {
    // loading: getDownloadInfo.loading || Download.loading,
    pixelType,
    setPixelType,
    exportType,
    setExportType,
    beforeDownLoad,
    getDownloadInfo,
    ...vipStatus,
  };
}

declare const Types: ['refresh', 'openDownloadModal'];
export declare type GetType = typeof Types[number];

export function useGetDownload(
  type: GetType = 'openDownloadModal',
  callback?: (today_dln_value?: number) => void,
) {
  const { checkLoginStatus } = useCheckLoginStatus();
  const { update } = useGetDownloadInfo();
  const { setPixelType, exportType } = useDownloadInfo();
  const RechargeModal = useRechargeModal();
  const DownloadPopover = useDownloadPopover();
  const { updateCouponStatus } = useCouponStatus();
  const downloadTheTransfiniteModal = useDownloadTheTransfiniteModal();
  const teamCountModal = useTeamCountModal(); // 团队下载限制弹框
  const { open: downloadTheTransfiniteModalOpen } = downloadTheTransfiniteModal;
  const { run } = useRequest(getDownloadInfo, {
    manual: true,
    onSuccess: res => {
      const { vip_type, is_upg, pkg_count } = res;
      update(res);

      if (
        res.max_dln_value !== -1 &&
        res.max_dln_value <= res.total_dln_value
      ) {
        downloadTheTransfiniteModalOpen();
      } else {
        if (res?.team_id && res?.team_id != 0 && res.limited_unit === 'set') {
          teamCountModal.open('set', res?.team_id);
          dataTeam({ team_id: res?.team_id, action_type: 'dlSetPopup' });
          return;
        }
        if (
          res?.team_id &&
          res?.team_id != 0 &&
          res.limited_unit === 'memberLess'
        ) {
          teamCountModal.open('memberLess', res?.team_id);
          dataTeam({ team_id: res?.team_id, action_type: 'memberLessPopup' });
          return;
        }
        // 设置默认选中清晰度  非vip或vip没有次数选中480，vip有次数选中1080P
        if (res.vip_type !== 0 && (res.vip_value > 0 || res.dln_value === -1)) {
          setPixelType('1080P');
        } else {
          setPixelType('480P');
        }

        if (type === 'openDownloadModal') {
          // 今日下载次数已用完
          if (!res.today_dln_value) {
            if (vip_type === 0) {
              // 非VIP下载受限，弹出充值弹框
              RechargeModal.open();
            } else {
              bindWarnModal(true, () => {
                if (is_upg && pkg_count === 1) {
                  // VIP下载受限，商用版弹出商用充值弹框，下载版弹出充值提醒弹出
                  if ([301, 302, 303].indexOf(vip_type) > -1) {
                    updateCouponStatus({ tagKey: '10', upgradeMode: true });
                  } else {
                    updateCouponStatus({ tagKey: '20', upgradeMode: true });
                  }
                  RechargeModal.open();
                } else {
                  window.open('https://xiudodo.com/myspace/vip');
                }
              });
            }
            // 下载受限埋点
            downloadLimit({ vip_type: res.vip_type, limited_type: exportType === 'mp4' ? 'dlNum' : 'gifDl' });
            return;
          }

          DownloadPopover.open();
        }

        if (callback) {
          callback(res.today_dln_value);
        }
      }
    },
    onError: err => {
      console.log(err);
    },
  });

  function open() {
    if (!checkLoginStatus()) {
      if (type === 'openDownloadModal') {
        handleSave({ onSuccess: run });
        return;
      }
      run();
    }
  }

  return { open, run };
}
