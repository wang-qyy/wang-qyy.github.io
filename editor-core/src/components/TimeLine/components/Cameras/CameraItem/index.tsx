import { useMouseHandle } from '@/components/TimeLine/hooks';
import { ChangeType } from '@/components/TimeLine/types';
import {
  setEditCamera,
  getCurrentCamera,
  Camera,
  cameraUpdater,
  saveCamera,
  useCameraByObeserver,
  TemplateClass,
} from '@hc/editor-core';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useLayoutEffect, useRef } from 'react';
import XiuIcon from '@/components/XiuIcon';
import { CAMERA_MIN_DURATION } from '@/config/basicVariable';
import { Tooltip } from 'antd';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import { useTimelineStore } from '../../../context';
import { calcTimeToPx } from '../../../utils/track';
import ClipItem from '../../ClipItem/ClipItem';
import styles from '../index.less';
import Action from './action';

const CameraItem = (props: {
  preLength: number;
  template: TemplateClass;
  cameras: CameraState[];
  data: CameraState;
  index: number;
  height: number;
}) => {
  const { data, height, index, cameras, template, preLength } = props;
  const addBeforeRef = useRef<HTMLDivElement>(null);
  const addAfterRef = useRef<HTMLDivElement>(null);
  const currentCamera = getCurrentCamera();
  const { addCamera } = useCameraByObeserver(template);
  const { endTime, startTime } = data.camera;
  const timeLineStore = useTimelineStore();
  const { scale, scroll } = timeLineStore;
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);
  const originCamera = useRef<Camera>(null);
  // 改变时间的限制值
  const limit = useRef<{ min: number; max: number }>();
  // 镜头的最短时间限制宽度
  const cameraMinWidth = calcTimeToPx(CAMERA_MIN_DURATION, scale);

  const width = calcTimeToPx(endTime - startTime, scale);
  const left = calcTimeToPx(startTime, scale);

  const active = currentCamera?.id === data.id;

  const handleMouseDown = (changeType: ChangeType, e: MouseEvent) => {
    if (!data) {
      return;
    }
    e.stopPropagation();
    setEditCamera(data);
    // @ts-ignore
    originCamera.current = data.getCameraCloned();
    limit.current = {
      min: 0,
      max: template.endTime,
    };
    if (index !== 0 && cameras[index - 1]) {
      limit.current.min = cameras[index - 1].camera.endTime;
    }
    if (index !== cameras.length - 1 && cameras[index + 1]) {
      limit.current.max = cameras[index + 1].camera.startTime;
    }
    if (changeType === 'start') {
      limit.current.max = Math.min(
        limit.current.max,
        endTime - CAMERA_MIN_DURATION,
      );
    }
    if (changeType === 'end') {
      limit.current.min = Math.min(
        limit.current.max,
        startTime + CAMERA_MIN_DURATION,
      );
    }
  };
  // 左边手柄
  useMouseHandle({
    ele: startRef,
    stopPropagation: true,
    onMouseDown: e => {
      handleMouseDown('start', e);
    },
    onMouseMove: info => {
      if (originCamera.current && limit.current) {
        let newStart = originCamera.current.startTime + info.distanceX * scale;

        newStart = Math.max(limit.current?.min, newStart);
        newStart = Math.min(limit.current?.max, newStart);
        cameraUpdater(data, {
          ...originCamera.current,
          startTime: newStart,
        });
      }
    },
    onMouseUp: info => {
      saveCamera();
    },
  });

  // 右边手柄
  useMouseHandle({
    ele: endRef,
    stopPropagation: true,
    onMouseDown: e => {
      handleMouseDown('end', e);
    },
    onMouseMove: info => {
      if (originCamera.current && limit.current) {
        let newEnd = originCamera.current.endTime + info.distanceX * scale;

        newEnd = Math.max(limit.current?.min, newEnd);
        newEnd = Math.min(limit.current?.max, newEnd);
        cameraUpdater(data, {
          ...originCamera.current,
          endTime: newEnd,
        });
      }
    },
    onMouseUp: info => {
      saveCamera();
    },
  });

  // 拖拽当前元素
  useMouseHandle({
    ele: moveRef,
    stopPropagation: true,
    onMouseDown: e => {
      handleMouseDown('move', e);
    },
    onMouseMove: info => {
      if (originCamera.current && limit.current) {
        const duration =
          originCamera.current.endTime - originCamera.current.startTime;

        let newStart = originCamera.current.startTime + info.distanceX * scale;
        let newEnd = newStart + duration;

        if (newStart < limit.current?.min) {
          newStart = limit.current?.min;
          newEnd = newStart + duration;
        }
        if (newEnd > limit.current?.max) {
          newEnd = limit.current?.max;
          newStart = newEnd - duration;
        }
        cameraUpdater(data, {
          ...originCamera.current,
          startTime: newStart,
          endTime: newEnd,
        });
      }
    },
    onMouseUp: info => {
      saveCamera();
    },
  });
  // 计算2个镜头之间连线的宽度
  const calcLineWidth = () => {
    const startT = endTime;
    let endT = endTime;
    if (index === cameras.length - 1) {
      endT = template.endTime;
    } else {
      endT = cameras[index + 1].camera.startTime;
    }
    const widthT = calcTimeToPx(endT - startT, scale);
    return widthT;
  };
  const lineWidth = calcLineWidth();

  const CameraTitle = () => {
    let tmpIndex = index;
    if (preLength) {
      tmpIndex += preLength;
    }
    if (tmpIndex === 0) {
      return <div className={styles['dragCamera-title']}>默认镜头</div>;
    }
    return <div className={styles['dragCamera-title']}>镜头{tmpIndex}</div>;
  };
  // 添加镜头
  const addCameraClick = (location: 'before' | 'after') => {
    addCamera(index, location);
  };
  const funBefore = (e: MouseEvent) => {
    e.stopPropagation();
    addCameraClick('before');
    clickActionWeblog('Timeline_camera_add');
  };
  const funAfter = (e: MouseEvent) => {
    e.stopPropagation();
    addCameraClick('after');
    clickActionWeblog('Timeline_camera_add');
  };
  const funStop = (e: MouseEvent) => {
    e.stopPropagation();
  };
  useLayoutEffect(() => {
    if (addAfterRef.current) {
      addAfterRef?.current.addEventListener('click', funAfter);
    }
    if (addBeforeRef.current) {
      addBeforeRef?.current.addEventListener('click', funBefore);
    }
    if (startRef.current) {
      startRef?.current.addEventListener('click', funStop);
    }
    if (endRef.current) {
      endRef?.current.addEventListener('click', funStop);
    }
    if (moveRef.current) {
      moveRef?.current.addEventListener('click', funStop);
    }
    return () => {
      addAfterRef?.current?.removeEventListener('click', funAfter);
      addBeforeRef?.current?.removeEventListener('click', funBefore);
      startRef?.current?.removeEventListener('click', funStop);
      endRef?.current?.removeEventListener('click', funStop);
      moveRef?.current?.removeEventListener('click', funStop);
    };
  }, []);
  return (
    <>
      {index === 0 && (
        <Tooltip title="添加镜头">
          <div
            className={classNames(
              styles['timeLine-dragCamera-link'],
              styles['last-dragCamera-link'],
              {
                [styles['no-action']]: left < cameraMinWidth,
              },
            )}
            style={{ left: left - 25 }}
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
      <Action data={data} index={index} template={template}>
        <div
          className={classNames(styles['timeLine-dragCamera'], {
            [styles['timeLine-dragCamera-active']]: active,
            [styles['timeLine-dragCamera-dragging']]: active,
          })}
          ref={moveRef}
          style={{
            width,
            height,
            left,
            display: width <= 0 ? 'none' : 'flex',
            position: 'absolute',
            pointerEvents: 'auto',
            cursor: 'grabbing',
            justifyContent: 'space-between',
          }}
        >
          <ClipItem width={width} ref={startRef} time={startTime} />
          <CameraTitle />
          <ClipItem width={width} ref={endRef} time={endTime} />
        </div>
      </Action>
      <div
        className={classNames(styles['timeLine-dragCamera-link'], {
          [styles['last-dragCamera-link']]: index === cameras.length - 1,
          [styles['no-action']]: lineWidth < cameraMinWidth,
        })}
        style={{ left: width + left, width: lineWidth }}
      >
        <Tooltip title="添加镜头">
          <div className={styles.add} data-change={false} ref={addAfterRef}>
            <XiuIcon type="iconxingzhuangjiehe6" />
          </div>
        </Tooltip>
        <div className={styles.line}>
          <div className={styles.dian} />
          <div className={styles.triangle} />
        </div>
      </div>
    </>
  );
};

export default observer(CameraItem);
