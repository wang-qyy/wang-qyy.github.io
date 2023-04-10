import { Progress } from 'antd';
import { PropsWithChildren } from 'react';
import { InfoCircleFilled } from '@ant-design/icons';

interface UploadProgressProps {
  percent: number;
  state: 0 | 1 | 2 | -1 | -2;
  hidden?: boolean;
}

export default function UploadProgress({
  percent,
  state,
  ...others
}: PropsWithChildren<UploadProgressProps>) {
  return (
    <div className="upload-file-item-progress" {...others}>
      {[-2, -1].includes(state) && (
        <InfoCircleFilled style={{ fontSize: 20, color: '#FE822A' }} />
      )}

      <span style={{ color: '#fff', fontSize: 12 }}>
        {
          {
            0: '排队中……',
            3: '上传中……',
            1: '上传成功',
            2: '转码中……',
            '-2': <span>涉嫌违规，无法上传!</span>,
            '-1': <span>上传失败！</span>,
          }[state]
        }
      </span>
      {[0, 3, 1].includes(state) && (
        <Progress
          percent={percent}
          trailColor="#fff"
          strokeColor="#5646ED"
          showInfo={false}
        />
      )}
    </div>
  );
}
