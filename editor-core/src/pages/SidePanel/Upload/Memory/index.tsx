import { forwardRef } from 'react';
import { Progress } from 'antd';

import { useRechargeModal } from '@/store/adapter/useGlobalStatus';
import { useUserInfo } from '@/store/adapter/useUserInfo';

import './index.less';

function UploadMemory(props: any) {
  const { setMemoryState, data, ...others } = props;

  const { id: userId } = useUserInfo();

  const {
    useMemory = 0,
    maxMemory = 0,
    unit,
    maxMemoryByte = 0,
    useMemoryByte = 0,
  } = data || {};

  const { open } = useRechargeModal();

  return (
    <div className="upload-memory" {...others}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          存储空间：
          <span className="useMemory">
            {useMemory}
            {unit}
          </span>
          / {maxMemory}
          {unit}
        </span>
        <span
          hidden={userId === -1}
          className="upload-memory-recharge"
          onClick={open}
        >
          扩容
        </span>
      </div>
      <Progress
        percent={(useMemory / maxMemory) * 100}
        showInfo={false}
        trailColor="#fff"
        strokeColor="#5646ED"
      />
    </div>
  );
}

export default UploadMemory;
