import { useEffect, useState } from 'react';
import {
  setActiveAssetLoading,
  observer,
  useShowMattingPic,
  toJS,
  useActiveAssetLoading,
} from '@hc/editor-core';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import {
  useRechargeModal,
  useUserLoginModal,
} from '@/store/adapter/useGlobalStatus';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { getPkgInfo, getCheckMattig, getEditorMatting } from '@/api/pictures';
import { useCouponStatus } from '@/store/adapter/useCouponStatus';
import NoTitleModal from '@/components/NoTitleModal';
import { clickActionWeblog, mattingWeblog } from '@/utils/webLog';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { XiuIcon } from '@/components';
import styles from './index.less';

const Matting = (props: {
  asset: AssetItemState;
  resId: string;
  u_file_id: string;
}) => {
  const { asset, resId, u_file_id = '' } = props;
  const [visible, setVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const RechargeModal = useRechargeModal();
  const { value, setMattingPic, clearMattingPic } = useShowMattingPic();
  const userLoginModal = useUserLoginModal();
  const userInfo = useUserInfo();
  const [mattingLoadding] = useActiveAssetLoading(asset); // 抠图状态
  const { updateCouponStatus } = useCouponStatus();

  // 检查抠图结果
  const { run: checkRun, cancel: checkCancel } = useRequest(getCheckMattig, {
    manual: true,
    pollingInterval: 2000,
    pollingWhenHidden: false,
    onSuccess: (result, params) => {
      const { output_url, file_id, scan_flag, step, source_id } = result[0];
      if (scan_flag == 3 || step === 'error') {
        checkCancel();
        setActiveAssetLoading(asset, false);
        message.success('抠图失败');
        return;
      }
      if (step === 'success') {
        setMattingPic(asset, { output_url, file_id, source_id });
        setActiveAssetLoading(asset, false);
        checkCancel();
        message.success('抠图成功');
      }
    },
    onError: error => {
      message.error(error.message);
      setActiveAssetLoading(asset, false);
      checkCancel();
    },
  });

  // 抠图
  const { run, cancel } = useRequest(getEditorMatting, {
    manual: true,
    onSuccess: (result, params) => {
      const { id } = result;
      checkRun(id);
    },
    onError: error => {
      message.error(error.message);
      setActiveAssetLoading(asset, false);
    },
  });

  // 点击抠图按钮
  const clickMattingBtn = (val: boolean) => {
    if (userInfo.id < 0) {
      // 未登录 弹出登录窗口
      userLoginModal.showLoginModal();
      return;
    }
    if (!val) {
      // 抠图前需要 执行判断 账号是否有 抠图机会 ，弹框提醒用户，当前抠图会消耗一次机会
      // 非VIP 用户每日一次抠图机会， 用完后，直接弹充值弹框 充值。

      getPkgInfo().then(res => {
        const total = res.data?.today_value;
        const is_vip = res.data?.is_vip;
        if ((is_vip && total === -1) || total >= 1) {
          setTotal(total);
          setVisible(true);
        } else {
          updateCouponStatus({ limitType: 'matting' });
          RechargeModal.open();
          mattingWeblog('KTLimited', { resId, vip_type: userInfo.vip_type });
        }
      });
    } else {
      clearMattingPic(asset);
    }
  };

  // 开始抠图
  const startMatting = () => {
    clickActionWeblog(`tool_kt003`, {
      action_label: asset?.attribute?.isUser ? 'userUp' : 'asset',
    });
    setVisible(false);
    setActiveAssetLoading(asset, true);
    if (resId) {
      run(resId, u_file_id);
    }
  };

  // 组件卸载取消抠图状态
  useEffect(() => {
    return () => {
      cancel();
      checkCancel();
      setActiveAssetLoading(asset, false);
    };
  }, []);

  return (
    <>
      <div onClick={e => e.stopPropagation()}>
        <NoTitleModal
          visible={visible}
          width={380}
          onCancel={() => {
            setVisible(false);
          }}
          centered
          footer={null}
        >
          <div className={styles.mattingModal}>
            <div className={styles.mattingModalTitle}>
              <span>
                今日剩余抠图次数：
                <span className={styles.spanSpan}>{total}</span> 次
              </span>
              <span>
                本次消耗：<span className={styles.spanSpan}>{1}</span> 次
              </span>
            </div>
            <div className={styles.mattingModalBtn} onClick={startMatting}>
              确认抠图
            </div>
          </div>
        </NoTitleModal>
      </div>

      <div
        onClick={() => {
          if (mattingLoadding) {
            return;
          }
          clickMattingBtn(value);
        }}
        style={
          mattingLoadding
            ? {
              cursor: 'not-allowed',
            }
            : {}
        }
        className={styles.mattinBtn}
      >
        <XiuIcon type="koutu" className={styles.mattinBtnIcon} />
        {value ? '取消抠图' : '抠图'}
      </div>
    </>
  );
};

export default observer(Matting);
