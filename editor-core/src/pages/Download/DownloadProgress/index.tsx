import React, { memo, useEffect, useState } from 'react';
import { Progress, Button, message } from 'antd';
import { useRequest, useSetState } from 'ahooks';
import { checkWatermarkRes, binddownloadlink } from '@/api/watermark';
import { ViolationModal } from '@/components/ViolationModal';
import { useDownloadProgress } from '@/store/adapter/useGlobalStatus';
import XiuIcon from '@/components/XiuIcon';

import './index.less';

import PubModalContent from '@/components/PubModalContent';
import NoTitleModal from '@/components/NoTitleModal';

// import {iframeDownload} from '@/utils/single'

function ProgressMain({ jobId, type }: { jobId: string; type?: string }) {
  const [state, setState] = useSetState({
    percent: 0,
    downloadUrl: '',
  });
  const { percent, downloadUrl } = state;
  const downloadProgress = useDownloadProgress();

  const startCheckOrder = useRequest(checkWatermarkRes, {
    manual: true,
    pollingInterval: 2000,
    onSuccess: data => {
      if (percent < 90) {
        const randomBase = Math.floor(Math.random() * 3) || 1;
        const randomNum = percent < 50 ? randomBase + 2 : randomBase;
        setState({
          percent: percent + randomNum,
        });
      }
      if (data.data.step === 'fail') {
        renderOver();
      }

      if (data.data.step === 'success') {
        startCheckOrder.cancel();
        if (type === 'watermark') {
          binddownloadlink(data.data.id).then(res => {
            if (res.stat == -9) {
              message.error('当前资源已过期，请重新合成');
            }
            if (res?.data?.video_scan_flag === 3) {
              ViolationModal({
                goHome: () => {
                  window.open('https://xiudodo.com/watermark/');
                },
              });
              return;
            }
            if (res?.data?.img_scan_flag === 3) {
              ViolationModal({
                onCancel: () => {
                  downloadProgress.close();
                },
              });
              return;
            }
            setState({
              percent: 100,
              downloadUrl: res.data.url,
            });
          });
        } else {
          setState({
            percent: 100,
            downloadUrl: data.data.url,
          });
        }
      }
    },
  });

  function renderOver() {
    startCheckOrder.cancel();
    downloadProgress.close();
  }

  function downloadVideo() {
    // iframeDownload(downloadUrl)
    window.open(downloadUrl);
    downloadProgress.close();
    // window.close();
  }

  useEffect(() => {
    if (jobId) {
      startCheckOrder.run(jobId);
    }
  }, [jobId]);
  const showDownloadUrl = downloadUrl && percent === 100;
  return (
    <div className="video-download-Progress" style={{ width: '100%' }}>
      <PubModalContent
        topNode={<div className="vd-progress-title" />}
        bottomNode={
          <div className="vd-progress-content">
            {showDownloadUrl ? (
              <>
                <h3 className="vd-progress-content-title">视频合成成功！</h3>
                <div className="vd-progress-content-content">
                  <XiuIcon type="iconduihao" />
                </div>

                <Button
                  type="primary"
                  className="vd-progress-content-footer"
                  onClick={downloadVideo}
                >
                  下载视频
                </Button>
                {/* <PubModalQQPanel /> */}
              </>
            ) : (
              <>
                <h3 className="vd-progress-item-title">视频正在合成中…</h3>
                <div className="vd-progress-item">
                  <Progress
                    strokeColor={{
                      '0%': '#5200FF',
                      '100%': '#B100FF',
                    }}
                    type="circle"
                    percent={percent}
                    width={125}
                    status="active"
                  />
                </div>
                <p className="vd-progress-item-footer">
                  请耐心等待，视频合成完即可下载～
                </p>
              </>
            )}
          </div>
        }
      />
    </div>
  );
}

const DownloadProgress = (props: any) => {
  const { type } = props;
  const downloadProgress = useDownloadProgress();

  return (
    <NoTitleModal
      title={null}
      style={{ top: '25%' }}
      visible={downloadProgress.value}
      onCancel={downloadProgress.close}
      wrapClassName="vd-progress-modal"
      width={554}
      closable={false}
      keyboard={false}
      footer={false}
      maskClosable={false}
    >
      <ProgressMain jobId={downloadProgress.jobId} type={type} />
    </NoTitleModal>
  );
};

export default memo(DownloadProgress);
