import { observer } from 'mobx-react';
import { Tooltip } from 'antd';

import { XiuIcon } from '@/components';
import { msToSeconds } from '@/components/TimeLine/utils/common';
import {
  getAllTemplates,
  getCurrentTemplate,
  StaticTemplate,
  useVideoHandler,
} from '@/kernel';
import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { useGetCanvasInfo, setCurrentTemplate } from '@/kernel/store';
import {
  deleteTempBySingle,
  getCanvasShape,
  useCopyTemplate as getCopyTemplate,
} from '@/utils/templateHandler';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

import styles from './index.less';
import Card from '../Card';
import { style } from 'wavesurfer.js/src/util';

const Parts = () => {
  const { width: canvasW, height: canvasH } = useGetCanvasInfo();
  const shape = getCanvasShape();
  const temps = getAllTemplates();
  const currentTemplate = getCurrentTemplate();
  const { setCurrentTime } = useVideoHandler();
  const { value: canvasInfo } = useUpdateCanvasInfo();

  const width = shape === 'h' ? 140 : 210;

  const itemStyle = {
    width,
    height: width * (canvasH / canvasW),
  };

  const switchTemp = (index: number) => {
    setCurrentTemplate(index);
    setCurrentTime(0);
  };

  // currentTemplate?.template?.poster

  return (
    <div className={styles.Parts}>
      {temps.map((temp, index) => {
        const timeInfo = msToSeconds(temp.videoInfo.allAnimationTimeBySpeed);
        const { copy } = getCopyTemplate(temp);

        const copyPart = () => {
          copy();
          clickActionWeblog('concise6');
        };

        return (
          <Card
            key={temp.id}
            active={currentTemplate?.id === temp.id}
            style={itemStyle}
            onClick={() => {
              switchTemp(index);
            }}
            hiddenContent={
              <div className={styles.operation}>
                <Tooltip title="复制片段">
                  <div className={styles.copy} onClick={copyPart}>
                    <XiuIcon type="iconfuzhi1" />
                  </div>
                </Tooltip>
                <Tooltip title="删除片段">
                  <div
                    className={styles.delete}
                    onClick={e => {
                      stopPropagation(e);
                      deleteTempBySingle(temp);
                      clickActionWeblog('concise7');
                    }}
                  >
                    <XiuIcon type="iconshanchu" />
                  </div>
                </Tooltip>
              </div>
            }
            showContent={
              <div className={styles.duration}>
                {timeInfo.m}:{timeInfo.s}
              </div>
            }
          >
            {/* <StaticTemplate
              canvasInfo={{
                ...canvasInfo,
                scale: itemStyle.height / canvasInfo.height,
              }}
              currentTime={100}
              templateIndex={index}
            /> */}
            <div
              className={styles.cover}
              style={{
                backgroundImage: `url(${temp.template.poster})`,
              }}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default observer(Parts);
