import { useRef } from 'react';
import { observer, useAssetAeAByObserver } from '@hc/editor-core';

import { XiuIcon } from '@/components';
import { inAnimation, outAnimation } from '@/mock/animation';
import AnimationList from '../Options';

import './index.less';

export const animationType: any = {
  in: 'i',
  out: 'o',
  stay: 's',
  inout: 'o&i',
};

export type typeKey = keyof typeof animationType;

export interface AnimationListProps {
  active: number;
  type: typeKey;
  className?: string;
  data: {
    id: number;
    name: string;
    items: Array<{ [key: string]: string }>;
  }[];
}

const Effects = ({ type, data, active }: AnimationListProps) => {
  const newData = data?.find(item => item.type === type)?.items || [];
  const timer = useRef();

  const { value, update, preview, previewEnd, clear } = useAssetAeAByObserver();

  function clearAnimation() {
    clearTimeout(timer.current);
    if (type === 'inout') {
      clear('i');
      clear('o');
    } else {
      clear(animationType[type]);
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div className="animation-item" onClick={clearAnimation}>
        <div className="default-background">
          <XiuIcon type="iconIcon-jinyong" />
        </div>
        <div className="animation-title">无动画</div>
      </div>

      <AnimationList type={type} data={newData} selected={active} />
    </div>
  );
};

export default observer(Effects);
