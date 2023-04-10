import { useState } from 'react';
import { Input, Empty, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import { useGetCurrentAsset } from '@hc/editor-core';
import { debounce } from 'lodash-es';

import { stopPropagation } from '@/utils/single';
import {
  useLeftSideInfo,
  useVideoPreviewModal,
  useLayersVisit,
  useVideoVolumeController,
  useAiDubbingModal,
  useGuideInfo,
} from '@/store/adapter/useGlobalStatus';
import { problemHelpWebLog } from '@/utils/webLog';
import { guide, GuideActionType } from './questions';
import { TrimDurationGuide, AssetClip, NoviceGuide } from '../Guide/variable';

export default function Content({ onClose }: { onClose: () => void }) {
  const currentAsset = useGetCurrentAsset();
  const [result, setResult] = useState(guide);
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const { open: openLayers } = useLayersVisit();

  const { openSidePanel } = useLeftSideInfo();
  const { open: openVideoPreviewModal } = useVideoPreviewModal();
  const { open: openVideoVolumeController } = useVideoVolumeController();
  const { open: openAiDubbingModal } = useAiDubbingModal();
  const { open: openVideoSplitGuide } = useGuideInfo();

  const changeSearch = debounce((search?: string) => {
    setSearchKey(search);

    let test = guide;

    if (search) {
      test = guide.filter((item, index) => item.title.indexOf(search) > -1);
      problemHelpWebLog({
        action: 'search',
        word: search,
      });
    }

    setResult(test);
  }, 300);

  function handleClick(actionType: GuideActionType) {
    switch (actionType) {
      case 'asset_unlock': // 元素解锁
        break;
      case 'recording': // 录音
        openSidePanel({ menu: 'music', submenu: '3' });
        break;
      case 'open_audio_list': // 打开音乐列表
        openSidePanel({ menu: 'music', submenu: '2' });
        break;
      case 'audio_mute': // 音频静音
        break;
      case 'layers': // 打开图层
        openLayers();
        break;
      case 'preview_video': // 预览视频
        openVideoPreviewModal();
        break;
      case 'background_video_replace':
        break; // 替换背景视频
      case 'asset_upload': // 上传图片或视频
        openSidePanel({ menu: 'user-space' });
        break;
      case 'asset_duration_controller': // 调整元素时长
        if (!currentAsset) {
          return message.info('请在画布上选中您要调整的元素');
        }
        openVideoSplitGuide(TrimDurationGuide);
        break;
      case 'video_split': // 片段分割
        onClose();
        openVideoSplitGuide(AssetClip);
        break;
      case 'asset_video_volume_controller': // 视频音量
        if (!['video', 'videoE'].includes(String(currentAsset?.meta.type))) {
          return message.info('请在画布上选中您要调整的视频');
        }
        openVideoVolumeController();
        break;

      case 'AIDubbing': // 配音
        if (currentAsset?.meta.type !== 'text') {
          return message.info('请在画布上选中您要配音的文字');
        }
        openAiDubbingModal();
        break;
      default:
    }

    problemHelpWebLog({
      action: 'lookGuide',
      guideType: actionType,
    });
  }

  return (
    <div style={{ color: '#262e48' }}>
      {/* <div className="questions-modal-qrcode-wrap">
        <span style={{ marginRight: 80 }}>
          若您遇到了操作上的问题 可微信扫码咨询客服{' '}
          <span
            style={{
              display: 'inline-block',
              transform: 'rotate(90deg)',
            }}
          >
            👆
          </span>
        </span>
        <QRCode
          value="https://work.weixin.qq.com/kfid/kfcf7c815de3b3edd21"
          size={90}
        />
      </div> */}
      <div className="questions-modal-search">
        <span>也可以通过搜索寻求帮助</span>
        <Input
          onPaste={stopPropagation}
          onKeyDown={stopPropagation}
          // prefix={<UserOutlined className="site-form-item-icon" />}
          prefix={<SearchOutlined />}
          placeholder="搜索帮助"
          onChange={e => {
            changeSearch(e.target.value);
          }}
          allowClear
        />
      </div>

      <div className="questions-modal-list-wrap">
        <span hidden={searchKey}>您是否遇到了以下问题：</span>
        <div className="questions-modal-list">
          {result.length ? (
            result.map(({ title, describe, actionType }, index) => {
              const desc = String(describe).split('${click}');

              return (
                <div key={`question-${index}`} className="list-item">
                  <div className="list-item-title">{title}</div>

                  <div>
                    {desc.map((item, i) => (
                      <span key={`question-desc-${i}`}>
                        {item}
                        {i !== desc.length - 1 && (
                          <>
                            <span
                              className="questions-action-click"
                              onClick={() => handleClick(actionType)}
                              onMouseDown={stopPropagation}
                            >
                              点击这里
                            </span>
                            ，
                          </>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <Empty
              description={
                <div>
                  <p>抱歉，没有找到您的问题相关解答！</p>
                  <p>
                    可以扫上面二维码直接找客服解决。<span>👆</span>
                  </p>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
