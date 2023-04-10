import { useState } from 'react';
import { Upload, Progress, message } from 'antd';
import { useSetState } from 'ahooks';
import { StaticTemplate, useGetTimeScale } from '@hc/editor-core';

import { beforeUpload, useCoverUpload } from '@/hooks/useUploadImg';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { XiuIcon } from '@/components';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';

import { getUserInfo } from '@/store/adapter/useUserInfo';

import {
  useTemplateInfo,
  useUpdateCanvasInfo,
} from '@/store/adapter/useTemplateInfo';
import { clickActionWeblog } from '@/utils/webLog';

const UploadIcon = (props: any) => {
  return (
    <div className="upload-icon" {...props}>
      <XiuIcon type="iconic_image_upload_mult" style={{ fontSize: 20 }} />
      <div className="text">上传</div>
    </div>
  );
};
export default function CoverUploadImg(props: {
  currentTime: number;
  onchange: ({ path: string, url: string }) => void;
}) {
  const { currentTime, onchange } = props;
  const { checkLoginStatus } = useCheckLoginStatus();

  const [state, setState] = useSetState<{
    uploadFile: any[];
    progress: any;
  }>();
  const { templateInfo } = useTemplateInfo();
  const { value: canvasInfo } = useUpdateCanvasInfo();
  const timeScale = useGetTimeScale();
  const [picUrl, setPicUrl] = useState(templateInfo?.cover_url);
  const { showBindPhoneModal } = useUserBindPhoneModal();

  const { uploadStat } = useCoverUpload({
    setProgress: (progress: number) => {
      setState({ progress });
    },
    onSucceed: (code: number, data: any) => {
      setTimeout(() => {
        setPicUrl(data.url);
        onchange({ path: data.path, url: data.url });
        setState({ progress: undefined });
      }, 1000);
    },
    onError: () => {
      setState({ status: 'error' });
    },
  });
  const StaticCanvas = (width, height) => {
    if (!currentTime || currentTime <= 0 || state?.progress) {
      return null;
    }
    const scale = height / canvasInfo.height;

    const calcIndex = (time: number, list: number[]) => {
      if (list[0] <= time && list[1] >= time) {
        return true;
      }
      return false;
    };
    const index = () => {
      let idx = 0;
      if (timeScale) {
        for (let i = 0; i < timeScale.length; i++) {
          if (calcIndex(currentTime, timeScale[i])) {
            idx = i;
          }
        }
      }
      return idx;
    };
    const time = () => {
      let cTime = currentTime;
      const i = index();
      if (i > 0) {
        cTime -= timeScale[i - 1][1];
      }
      return cTime;
    };
    return (
      <StaticTemplate
        key="1"
        canvasInfo={{
          ...canvasInfo,
          scale,
        }}
        currentTime={time()}
        templateIndex={index()}
      />
    );
  };
  return (
    <>
      <div className="cover-upload">
        <div className="user-upload-btn">
          <div className="btn">
            <Upload
              accept="image/png, image/jpeg"
              beforeUpload={(file: Blob) => {
                if (getUserInfo()?.bind_phone !== 1) {
                  showBindPhoneModal();
                } else {
                  beforeUpload(file, (info: any) => {
                    const max_size = 500 * 1024;
                    if (file.size <= max_size) {
                      let uploadFile = [
                        {
                          ...info,
                          status: 'uploading',
                          id: info.file.uid,
                        },
                      ];

                      if (state.uploadFile) {
                        uploadFile = uploadFile.concat(state.uploadFile);
                      }
                      uploadStat(uploadFile[0].file);
                    } else {
                      message.info('最大上传500k文件');
                    }
                  });
                }
              }}
              // multiple
              showUploadList={false}
            >
              <UploadIcon
                onClick={e => {
                  clickActionWeblog('download_007');
                  const loginStatus = checkLoginStatus();
                  if (loginStatus) {
                    e.stopPropagation();
                  } else {
                    if (getUserInfo()?.bind_phone !== 1) {
                      e.stopPropagation();
                      showBindPhoneModal();
                    }
                  }
                }}
              />
            </Upload>
          </div>
        </div>
        <div
          className="cover-pic-time"
          style={{ background: picUrl || currentTime ? '#f0f0f0' : '' }}
        >
          {currentTime <= 0 && !state?.progress && (
            <img style={{ width: 'auto', height: 65 }} src={picUrl} alt="" />
          )}
          {state?.progress && (
            <Progress
              percent={state?.progress}
              type="circle"
              width={50}
              strokeColor="#5A4CDB"
            />
          )}
          {StaticCanvas(114, 67)}
        </div>
      </div>
      <div className="upload-tip">（若需上传封面，建议大小不超过500K）</div>
    </>
  );
}
