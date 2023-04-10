import React from 'react';
import ColorPipette from './color-pipette';

function ColPipette() {
  // 初始化
  const pipette = new ColorPipette({
    container: document.body,
    scale: 2,
    listener: ({ color, colors }) => {
      console.log(color, colors);
    },
  });

  // 开始取色
  const bindClick = () => {
    pipette.start();
  };
  return <div onClick={bindClick}>取色器</div>;
}

export default ColPipette;
