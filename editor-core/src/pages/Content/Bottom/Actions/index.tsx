import { getCurrentAsset } from '@hc/editor-core';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { setBottomMode } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import TemplateActions from './TemplateActions';
import AudioActions from './AudioActions';
import Item from './Item';

import './index.less';

export default function Actions() {
  const { activeAudio } = useSetActiveAudio();
  const currentAsset = getCurrentAsset();

  return (
    <div className="xiudodo-bottom-part-action-wrap">
      {!currentAsset && activeAudio && <AudioActions />}
      {!currentAsset && !activeAudio && <TemplateActions />}
      {/* 暂时下掉批量替换 */}
      {/* <Item
        item={{
          name: '批量修改图片/视频',
          icon: 'iconic_image_upload_mult',
          isNew: true,
          onClick() {
            setBottomMode('simple');
            clickActionWeblog('bottom_0001');
          },
        }}
      /> */}
    </div>
  );
}
