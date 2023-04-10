import React, { useState, useEffect, useRef } from 'react';
import XiuIcon from '@/components/XiuIcon';
import { Tooltip, Popover, Divider } from 'antd';

import './index.less';
import ToolItem, { ToolsItem } from '../ToolItem';

function ToolMore(props: {
  data: any;
  throttledWidth: number;
  type: string | undefined;
  commonShow: boolean | undefined;
}) {
  const { data, throttledWidth, type, commonShow } = props;

  const [moreData, setMoreData] = useState([]);
  const [hidden, setHidden] = useState(true);
  const ref = useRef(null);

  // 获取更多工具展示数据
  const getMoreData = () => {
    const newData = data?.filter((item: any) => {
      return throttledWidth <= item?.minWidth && item?.show;
    });

    if (newData?.length > 0 && type === 'text') {
      setHidden(false);
    } else {
      setHidden(true);
    }
    setMoreData(newData);
  };

  const overlay = () => {
    return (
      <div className="toolMoreContent">
        {moreData?.map((item: ToolsItem) => {
          return (
            <ToolItem
              key={item.key}
              data={{ ...item, minWidth: 0 }}
              type={type}
              throttledWidth={throttledWidth}
            />
          );
        })}
      </div>
    );
  };

  // 获取更多里展示工具
  useEffect(() => {
    getMoreData();
  }, [throttledWidth, type, commonShow]);

  return (
    <>
      {!hidden && (
        <Divider type="vertical" style={{ margin: 'auto', height: '25px' }} />
      )}
      <Popover
        trigger="click"
        placement="bottomLeft"
        destroyTooltipOnHide
        content={overlay}
        getPopupContainer={ele => ele}
      >
        <Tooltip title="更多" placement="top">
          <div className="toolMore" hidden={hidden} ref={ref}>
            <XiuIcon className="toolMoreIcon" type="icongengduo_tianchong" />
          </div>
        </Tooltip>
      </Popover>
    </>
  );
}

export default ToolMore;
