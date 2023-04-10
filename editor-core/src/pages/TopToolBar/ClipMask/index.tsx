import { CSSProperties, PropsWithChildren, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useMount, useRequest } from 'ahooks';
import { observer } from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import XiuIcon from '@/components/XiuIcon';

import { getMaskList } from '@/api/pictures';
import './index.less';
import { stopPropagation } from '@/kernel/utils/single';
import ClipMaskList from './list';
import ClipMaskItem from './ClipMaskItem';

interface ClipMaskProps {
  className?: string;
  style?: CSSProperties;
}

const ClipMask = (props: PropsWithChildren<ClipMaskProps>) => {
  const { className, ...others } = props;
  const [list, setList] = useState([]);

  const { loading, run } = useRequest(getMaskList, {
    manual: true,
    // debounceInterval: 500,
    loadingDelay: 1000,
    onSuccess: (res, params) => {
      setList(res.items.splice(0, 2));
    },
  });

  useEffect(() => {
    run(1);
  }, []);

  return (
    <div
      className={classNames('clip-mask', className)}
      {...others}
      onClick={stopPropagation}
    >
      {list.map(item => {
        return (
          <ClipMaskItem
            item={item}
            type="index"
            className="clip-mask-tool"
            key={item.id}
          />
        );
      })}
      {list.length > 0 && (
        <OverwritePopover
          trigger="click"
          overlayStyle={{
            marginTop: 10,
            paddingLeft: 12,
          }}
          content={<ClipMaskList />}
        >
          <div className="clip-escWrap">
            <div className="clip-esc">
              <XiuIcon className="clip-escIcon" type="icongengduo_tianchong" />
            </div>
          </div>
        </OverwritePopover>
      )}
    </div>
  );
};

export default observer(ClipMask);
