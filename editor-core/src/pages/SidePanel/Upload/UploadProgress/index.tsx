import { memo, PropsWithChildren } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';

import './index.less';

interface ProgressProps {
  status: string | number;
  progress: string | number;
  visible?: boolean;
}

const Progress = ({
  visible = true,
  status = 'reading',
  progress,
}: PropsWithChildren<ProgressProps>) => {
  return (
    <div
      className="upload-progress"
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div className="upload-progress-info">
        正在上传……
        <div className="progress-inner">
          <div
            className="upload-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
      {status === 'error' && (
        <div className="upload-error">
          <div className="error-icon">
            <ExclamationCircleFilled />
          </div>
          上传失败!
        </div>
      )}
    </div>
  );
};
export default memo(Progress);
