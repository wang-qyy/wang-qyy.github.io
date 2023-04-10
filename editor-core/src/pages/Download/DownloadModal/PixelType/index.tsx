import { useState, CSSProperties, useMemo, useEffect } from 'react';
import { Radio, Button, Space } from 'antd';
import clx from 'classnames';
import { useDebounceFn } from 'ahooks';
import XiuIcon from '@/components/XiuIcon';
import { useBeforeDownLoad, useDownload } from '@/hooks/useDownload';
import {
  activeEditableAssetInTemplate,
  getTemplateIndexById,
  getTemplateTimeScale,
  setCurrentTime,
  observer,
} from '@hc/editor-core';
import { useReplaceRemind } from '@/hooks/useReplaceRemind';
import { useRechargeModal } from '@/store/adapter/useGlobalStatus';
import { useCouponStatus } from '@/store/adapter/useCouponStatus';
import type { PixelType } from '@/typing';

import './index.less';

import AWSC from '@/components/AWSC';
import { clickActionWeblog } from '@/utils/webLog';

// const radioStyle: CSSProperties = {
//   display: 'block',
//   height: '40px',
//   // lineHeight: '40px',
//   marginBottom: 10,
// };

interface DefinitionProps {
  platform: string;
  close: () => void;
  onChange: (v?: PixelType) => void;
}

const Definition = (props: DefinitionProps) => {
  const { close, platform, onChange } = props;
  const [AWSCvisible, setAWSCvisible] = useState(false);

  const {
    pixelType,
    loading,
    setPixelType,
    exportType,
    setExportType,
    remainingTimes,
    beforeDownLoad,
    today_dln_value,
    vipType,
    today_vip_dln_value,
  } = useBeforeDownLoad();
  const rechargeModal = useRechargeModal();

  const { total, data } = useReplaceRemind();
  const { updateCouponStatus } = useCouponStatus();

  const { startDownLoad } = useDownload();

  useEffect(() => {
    // 非VIP 选择 480P 时显示水印
    if (exportType === 'mp4') {
      onChange(pixelType as PixelType);
    } else {
      onChange();
    }
  }, [pixelType, exportType]);

  const onPixelTypeChange = (e: any) => {
    setPixelType(e.target.value);
    clickActionWeblog('download_004', { action_label: e.target.value });
  };

  const bindClose = () => {
    close();
    const ele = data[0];
    setCurrentTime(
      getTemplateTimeScale()[getTemplateIndexById(ele?.id)][0] +
        ele.attribute.startTime,
      false,
    );

    activeEditableAssetInTemplate(ele.meta.id);
    clickActionWeblog('download_003');
  };

  const pixelTypes = [
    { type: '480P', name: '标清480P' },
    { type: '720P', name: '高清720P（无水印）', icon: 'vip-badge' },
    { type: '1080P', name: '超清1080P（无水印）', icon: 'vip-badge' },
  ];

  const gifTypes = [
    { type: '480P', name: '标清GIF动图', icon: 'vip-badge' },
    { type: '720P', name: '高清GIF动图', icon: 'vip-badge' },
    { type: '1080P', name: '超清GIF动图', icon: 'vip-badge' },
  ];

  const renderDownloadTimesDesc = useMemo(() => {
    let dom = <></>;

    const TimesDom = ({ times }) => (
      <span className="pixel-remind remainingTimes">
        今日可下载 <span>{times}</span> 次
      </span>
    );

    if (today_dln_value === -1) {
      return <span className="remainingTimes">海量下载</span>;
    }

    switch (vipType) {
      case 0: // 非会员
        if (pixelType === '480P' && exportType === 'mp4') {
          dom = <TimesDom times={today_dln_value} />;
        }
        break;
      default:
        // 其他类型会员
        if (pixelType === '480P') {
          dom = <TimesDom times={today_dln_value} />;
        } else {
          if (today_vip_dln_value) {
            dom = <TimesDom times={today_vip_dln_value} />;
          } else {
            dom = (
              <>
                <TimesDom times={today_vip_dln_value} />
                <span
                  className="increaseRechargeModalOpenBtn"
                  onClick={() => {
                    if ([301, 302, 303].indexOf(vipType) > -1) {
                      updateCouponStatus({ tagKey: '20' });
                    }
                    if ([101, 102, 103, 104].indexOf(vipType) > -1) {
                      // 是否当前会员套餐已用完
                      updateCouponStatus({ tagKey: '20' });
                    }
                    rechargeModal.open();
                  }}
                >
                  点此补充
                </span>
              </>
            );
          }
        }
    }

    return dom;
  }, [exportType, pixelType, today_dln_value]);

  const { run: onClickFun } = useDebounceFn(
    () => {
      if (remainingTimes === 0) {
        beforeDownLoad();
        return;
      }
      startDownLoad(exportType, pixelType, platform, null, err => {
        if (err === 'displayNC') {
          // 海量下载用户 单日下载次数超过20次以上. 需要弹一次验证弹框.后续连续下载 每超过5次 会继续验证弹框.
          setAWSCvisible(true);
        }
      });
      clickActionWeblog('concise12');
    },
    { wait: 500 },
  );

  return (
    <div className="pixel-type">
      <h6>请选择下载你需要合成作品的类型</h6>

      <div className="export-select">
        <Radio.Group
          size="middle"
          buttonStyle="solid"
          className="export-type"
          value={exportType}
          onChange={e => {
            setExportType(e.target.value);
            clickActionWeblog('download_008', { action_label: e.target.value });
          }}
        >
          <Radio.Button value="mp4">MP4视频</Radio.Button>
          <Radio.Button value="gif">GIF动图</Radio.Button>
        </Radio.Group>

        <div className="pixel-type-div">
          <Radio.Group
            size="large"
            className={clx('pixel-type', { show: exportType === 'mp4' })}
            value={pixelType}
            onChange={e => {
              onPixelTypeChange(e);
              onChange(e.target.value);
            }}
          >
            <Space direction="vertical">
              {pixelTypes.map(type => (
                <Radio key={type.type} value={type.type}>
                  {type.name}
                  {type.icon && (
                    <XiuIcon
                      className="vip-badge"
                      type="iconVIPgerenzhongxin"
                    />
                  )}
                  {pixelType === type.type && renderDownloadTimesDesc}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <Radio.Group
            size="large"
            className={clx('pixel-type', { show: exportType === 'gif' })}
            value={pixelType}
            onChange={onPixelTypeChange}
          >
            <Space direction="vertical">
              {gifTypes.map(type => (
                <Radio key={type.type} value={type.type}>
                  {type.name}
                  {type.icon && (
                    <XiuIcon
                      className="vip-badge"
                      type="iconVIPgerenzhongxin"
                    />
                  )}
                  {pixelType === type.type && renderDownloadTimesDesc}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </div>

      <div hidden={vipType !== 0} className="alert-vip">
        <span
          className="increaseRechargeModalOpenBtn"
          onClick={() => rechargeModal.open()}
        >
          升级会员
        </span>
        ，立享高清无水印画质！
      </div>

      <Button
        loading={loading}
        type="primary"
        onClick={onClickFun}
        className="open-vip-modal"
        size="large"
      >
        {platform ? '立即合成' : '立即下载'}
      </Button>

      {platform && (
        <div className="pixel-type_footer-share">
          备注：视频需要合成后才能发布
        </div>
      )}
      {/* {total ? (
        <div className="pixel-type_footer">
          <div className="pixel-type_err">!</div>
          <div className="pixel-type_text">模板内仍有秀多多元素未修改替换</div>
          <div className="pixel-type_back" onClick={bindClose}>
            返回修改
          </div>
        </div>
      ) : null} */}
      {AWSCvisible && (
        <AWSC
          visible={AWSCvisible}
          setVisible={setAWSCvisible}
          onSuccess={data => {
            setAWSCvisible(false);
            startDownLoad(exportType, pixelType, platform, data, err => {
              if (err === 'displayNC') {
                // 海量下载用户 单日下载次数超过20次以上. 需要弹一次验证弹框.后续连续下载 每超过5次 会继续验证弹框.
                setAWSCvisible(true);
              }
            });
          }}
        />
      )}
    </div>
  );
};
export default observer(Definition);
