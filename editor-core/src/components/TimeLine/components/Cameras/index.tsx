import { useCreation } from 'ahooks';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { toJS } from 'mobx';
import { getAllTemplates, useCameraByObeserver } from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import { useLayoutEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { clickActionWeblog } from '@/utils/webLog';
import {
  useClickDraggable,
  useFormatData2Store,
  useScaleObserver,
  usePropsObserver,
} from '../../hooks';
import { TimelineContext } from '../../context';
import TimeLineStore from '../../store';
import styles from './index.less';
import globalStore from '../../store/globalStore';
import { calcTimeToPx } from '../../utils';
import CameraItem from './CameraItem';
import { TimeLineProps } from '../Item';

const Cameras = (props: TimeLineProps) => {
  const {
    data,
    options,
    // width,
    className,
    scale = 1,
    style,
    duration = 0,
    template,
  } = props;
  const global = globalStore;
  const { metaScaleWidth, scaleTime, scaleWidth } = global;
  const store = useCreation(() => new TimeLineStore(), []);
  const templateList = getAllTemplates();
  const addBeforeRef = useRef<HTMLDivElement>(null);
  const { addCamera } = useCameraByObeserver(template);
  usePropsObserver(props, store);
  useFormatData2Store(data, options, store);
  useScaleObserver(metaScaleWidth * scale, store);
  useClickDraggable(store);
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
    <TimelineContext.Provider value={store}>
      <div
        className={classNames(styles['timeLine-item-wrapper'], className)}
        style={style}
      >
        <div
          className={styles['timeLine-item']}
          style={{
            width: calcTimeToPx(duration, scaleTime / scaleWidth),
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
      </div>
    </TimelineContext.Provider>
  );
};

Cameras.defaultProps = {
  className: undefined,
  selectKeys: undefined,
  style: undefined,
};

export default observer(Cameras);
