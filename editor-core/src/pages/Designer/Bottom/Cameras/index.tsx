import { observer } from 'mobx-react';
import classNames from 'classnames';
import {
  getAllTemplates,
  TemplateClass,
  useCameraByObeserver,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import { CSSProperties, useLayoutEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { clickActionWeblog } from '@/utils/webLog';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import styles from './index.less';
import CameraItem from './CameraItem';
import { calcTimeToPx } from '../handler';

interface CamerasProps {
  className?: string;
  style?: CSSProperties;
  template: TemplateClass;
}
const Cameras = (props: CamerasProps) => {
  const { className, style, template } = props;
  const { allAnimationTime: pageTime } = template.videoInfo;
  const templateList = getAllTemplates();
  const addBeforeRef = useRef<HTMLDivElement>(null);
  const { addCamera } = useCameraByObeserver(template);
  const unitWidth = useGetUnitWidth();

  const preLength = () => {
    let num = 0;
    if (template) {
      const cIndex = templateList.findIndex(item => item.id === template.id);
      templateList.forEach((item, index) => {
        if (index < cIndex) {
          num += item.cameras.length;
        }
      });
    }
    return num;
  };
  const funBefore = (e: MouseEvent) => {
    e.stopPropagation();
    addCamera(-1, 'before');
    clickActionWeblog('Timeline_camera_add');
  };
  useLayoutEffect(() => {
    if (addBeforeRef.current && template?.cameras.length === 0) {
      addBeforeRef?.current.addEventListener('click', funBefore);
    }
    return () => {
      addBeforeRef?.current?.removeEventListener('click', funBefore);
    };
  }, [template?.cameras.length]);
  return (
    <div
      className={styles['timeLine-item']}
      style={{
        width: calcTimeToPx(pageTime, unitWidth),
        height: '100%',
      }}
    >
      {template?.cameras &&
        template.cameras.map((camera, index) => {
          return (
            <CameraItem
              preLength={preLength()}
              template={template}
              cameras={template.cameras}
              key={camera.id}
              data={camera}
              height={21}
              index={index}
            />
          );
        })}
      {template?.cameras.length === 0 && (
        <Tooltip title="添加镜头">
          <div
            className={classNames(
              styles['timeLine-dragCamera-link'],
              styles['last-dragCamera-link'],
            )}
            style={{ marginLeft: 10 }}
          >
            <div className={styles.add} ref={addBeforeRef}>
              <XiuIcon type="iconxingzhuangjiehe6" />
            </div>
            <div className={styles.line}>
              <div className={styles.dian} />
              <div className={styles.triangle} />
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
};

Cameras.defaultProps = {
  className: undefined,
  style: undefined,
};

export default observer(Cameras);
