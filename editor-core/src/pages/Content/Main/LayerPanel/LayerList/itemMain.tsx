import { useState } from 'react';
import classNames from 'classnames';
import { AssetClass, observer, isModuleType } from '@hc/editor-core';

import LayerItem from '../LayerItem';
import LayerList from '../LayerList';
import './index.less';

interface LayerPanelItemProps {
  data: AssetClass;
}

const LayerItemDrag = (props: LayerPanelItemProps) => {
  const { data } = props;
  const [collapsed, setCollapsed] = useState(false); // 组收起状态

  return (
    <>
      <LayerItem
        {...props}
        onCollapsed={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
      />
      {isModuleType(data) && (
        <LayerList
          assets={data.assets}
          className={classNames('layer-list-chidren', {
            'layer-list-chidren-collapsed': collapsed,
          })}
        />
      )}
    </>
  );
};
export default observer(LayerItemDrag);
