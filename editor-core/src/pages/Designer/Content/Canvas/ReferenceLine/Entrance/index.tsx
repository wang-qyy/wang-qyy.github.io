import React from 'react';
import { useReference } from '@/pages/Designer/Content/Canvas/ReferenceLine/hook/useReferenceLine';
import './index.less';
import { Dropdown, Menu } from 'antd';

function Entrance() {
  const { showLine, clearLine, show } = useReference();

  const menu = (
    <Menu>
      <Menu.Item onClick={showLine}>
        {show ? '关闭参考线' : '开启参考线'}
      </Menu.Item>
      <Menu.Item onClick={clearLine}>清除参考线</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="topCenter">
      <span className="xiudodo-designer-canvas-line">参考线</span>
    </Dropdown>
  );
}

export default Entrance;
