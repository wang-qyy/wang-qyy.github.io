import { PropsWithChildren } from 'react';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';

import { formatNumberToTime, stopPropagation } from '@/utils/single';
import Progress from './Progress';

import styles from './index.modules.less';

type StepType = 'pending' | 'start' | 'pulling' | 'pulled' | 'error';

interface WraperProps {
  title: string;
  duration?: number;
  onClick?: Function;
  step?: StepType;
  progress?: number;
}

export default function Wraper({
  children,
  title,
  duration,
  step,
  progress,
  ...reset
}: PropsWithChildren<WraperProps>) {
  return (
    <div className={styles.wrap} {...reset}>
      <div className={styles.content}>
        <div
          hidden={step !== 'pending' && step !== 'error'}
          onClick={stopPropagation}
          className={styles.progress}
        >
          {step === 'pending' && (
            <>
              <div style={{ marginBottom: 4 }}>{progress ?? 0}%</div>
              <Progress percent={progress} />
            </>
          )}
          {step === 'error' && (
            <>
              <ExclamationCircleFilled
                style={{ fontSize: 20, color: '#ED8046', marginBottom: 4 }}
              />
              <div>上传失败</div>
            </>
          )}
        </div>
        {children}
        <div className={styles.add}>
          <PlusOutlined />
        </div>
        {duration && (
          <div className={styles.duration}>
            {formatNumberToTime(parseInt(`${duration / 1000}`, 10))}
          </div>
        )}
      </div>
      <span className={styles.title} title={title}>
        {title}
      </span>
    </div>
  );
}
