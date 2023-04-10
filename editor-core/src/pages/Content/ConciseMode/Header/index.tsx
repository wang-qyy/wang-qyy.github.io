import { observer } from 'mobx-react';
import { Button, Progress } from 'antd';

import { XiuIcon } from '@/components';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import {
  getAllAudios,
  getAllTemplates,
  getAudioEditStatus,
  getBGMList,
} from '@/kernel';
import { useAddEmptyTemplate } from '@/utils/templateHandler';
import { clickActionWeblog } from '@/utils/webLog';

import styles from './index.less';
import conciseModeStore from '../store';

const Header = () => {
  const { open } = useAssetReplaceModal();
  const { pauseVideo } = useCanvasPlayHandler();
  // const { startReplace } = useReplaceStatusByObserver();
  const { hasEmpty } = useAddEmptyTemplate();
  const templates = getAllTemplates();
  const allAudio = getAllAudios();
  const BGMList = allAudio.filter(
    t => !(t.rt_sourceType === 2 && t.type === 2),
  );

  const replaced = getAudioEditStatus();

  const { resAssets } = conciseModeStore;

  const isEmpty = templates.length === 1 && hasEmpty;

  const replacedList = resAssets.filter(t => t.replaced);

  const openReplace = () => {
    open('replace-batch');
    pauseVideo();
    clickActionWeblog('concise1');
  };

  const openReplaceAudio = () => {
    open('replace-audio');
    pauseVideo();
    clickActionWeblog('concise2');
  };

  return (
    <div className={styles.Header}>
      {/* 功能隐藏 之后有需要再开发 */}
      <div className={styles.left} style={{ display: 'none' }}>
        <div>全模板已替换图片/视频</div>
        <Progress
          className={styles.progress}
          percent={(replacedList.length / resAssets.length) * 100}
          showInfo={false}
        />
        <div className={styles.progressText}>
          <span>{replacedList.length}</span>/{resAssets.length}
        </div>
        <Button
          disabled={replacedList.length === resAssets.length}
          onClick={openReplace}
          className={styles.replace}
          size="small"
        >
          一键替换
        </Button>
      </div>
      <div className={styles.right}>
        {/* 1、当背景音乐没有被修改情况下 可以替换背景音乐 ai 语音保持 不变
            2、当背景音乐被修改过、并且存在多条情况下 不给替换背景音乐 */}
        {/* 3、音乐替换 需要优化一下 当背景音乐存在多条情况下，才屏蔽背景音乐替换按钮。 */}
        {!isEmpty && (!replaced || BGMList.length <= 1) && (
          <Button
            type="text"
            size="small"
            icon={
              <XiuIcon
                type="yinle-61nfm32k"
                style={{ fontSize: 16, verticalAlign: 'middle' }}
              />
            }
            onClick={openReplaceAudio}
          >
            替换背景音乐
          </Button>
        )}
      </div>
    </div>
  );
};

export default observer(Header);
