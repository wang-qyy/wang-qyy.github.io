import { useState, useEffect, useRef } from 'react';
import { Popover, Input } from 'antd';
import { SketchPicker } from 'react-color';
import ColorPickup from '@/components/ColorPickup';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { useMount, useUpdateEffect } from 'ahooks';
import { toJS } from '@hc/editor-core';
import GradientPicker from './component/gradientPicker';
import DegPicker from './component/degPicker';
import './index.modules.less';
import { useGradientColor } from './useGradientColor';
import { getdataByBackground } from './util';

const gradientMock = [
  'linear-gradient(90deg, rgba(34, 84, 244,1) 25.39%, rgba(10, 207, 254,1) 100%)',
  'linear-gradient(90deg, rgba(2, 179, 244,1) 16.53%, rgba(0, 242, 254,1) 100%)',
  'linear-gradient(90deg, rgba(211, 255, 254,1) 0%, rgba(1, 237, 253,1) 100%)',
  'linear-gradient(90deg, rgba(102, 22, 206,1) 0%, rgba(34, 84, 244,1) 100%)',
  'linear-gradient(90deg, rgba(248, 54, 0,1) 0%, rgba(250, 204, 34,1) 100%)',
  'linear-gradient(90deg, rgba(255, 226, 89,1) 0%, rgba(255, 167, 81,1) 100%)',
  'linear-gradient(90deg, rgba(255, 225, 6,1) 0%, rgba(179, 255, 218,1) 100%)',
  'linear-gradient(90deg, rgba(247, 121, 125,1) 0%, rgba(249, 212, 35,1) 95%, rgba(255, 246, 41,1) 100%)',
  'linear-gradient(90deg, rgba(255, 11, 13,1) 0%, rgba(255, 121, 121,1) 100%)',
  'linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(254, 84, 85,1) 82.16%, rgba(245, 68, 68,1) 100%)',
  'linear-gradient(90deg, rgba(252, 92, 125,1) 0%, rgba(255, 251, 213,1) 100%)',
  'linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(196, 113, 237,1) 1%, rgba(246, 79, 89,1) 100%)',
  'linear-gradient(90deg, rgba(17, 153, 142,1) 0%, rgba(56, 239, 125,1) 100%)',
  'linear-gradient(90deg, rgba(171, 255, 203,1) 0%, rgba(0, 226, 104,1) 100%)',
  'linear-gradient(90deg, rgba(97, 255, 156,1) 0%, rgba(95, 175, 250,1) 100%)',
  'linear-gradient(90deg, rgba(140, 244, 190,1) 0%, rgba(250, 255, 209,1) 100%)',
  'linear-gradient(90deg, rgba(44, 241, 253,1) 0%, rgba(154, 192, 129,1) 50%, rgba(249, 149, 22,1) 94%)',
  'linear-gradient(90deg, rgba(48, 34, 238,1) 0%, rgba(143, 20, 128,1) 54%, rgba(236, 7, 19,1) 100%)',
  'linear-gradient(90deg, rgba(18, 214, 223,1) 0%, rgba(134, 113, 239,1) 48%, rgba(247, 15, 255,1) 94%)',
  'linear-gradient(90deg, rgba(30, 150, 0,1) 0%, rgba(255, 242, 0,1) 51%, rgba(243, 41, 53,1) 100%)',
  'linear-gradient(90deg, rgba(217, 255, 255,1) 0%, rgba(255, 232, 179,1) 100%)',
  'linear-gradient(90deg, rgba(185, 252, 249,1) 0%, rgba(255, 231, 239,1) 100%)',
  'linear-gradient(90deg, rgba(255, 250, 224,1) 0%, rgba(255, 209, 241,1) 100%)',
  'linear-gradient(90deg, rgba(214, 255, 205,1) 0%, rgba(181, 253, 238,1) 100%)',
  'linear-gradient(90deg, rgba(0, 0, 0,1) 26.5%, rgba(255, 255, 255, 0.22) 100%)',
  'linear-gradient(90deg, rgba(0, 0, 0,1) 17.6%, rgba(196, 196, 196, 0) 100%)',
  'linear-gradient(90deg, rgba(190, 190, 190,1) 0%, rgba(0, 0, 0,1) 100%)',
  'linear-gradient(90deg, rgba(48, 67, 82,1) 0%, rgba(215, 210, 204,1) 100%);',
  'linear-gradient(90deg, rgba(203, 166, 77,1) 0%, rgba(237, 205, 91,1) 26.5%, rgba(255, 251, 187,1) 50%, rgba(237, 205, 91,1) 72.3%, rgba(206, 171, 74,1) 100%)',
  'linear-gradient(90deg, rgba(185, 147, 13,1) 0%, rgba(254, 246, 149,1) 50%, rgba(183, 144, 9,1) 100%)',
  'linear-gradient(90deg, rgba(168, 182, 196,1) 0%, rgba(250, 246, 242,1) 53.5%, rgba(168, 182, 196,1) 100%)',
  'linear-gradient(90deg, rgba(104, 116, 125,1) 0%, rgba(240, 240, 240,1) 53.5%, rgba(104, 116, 125,1) 100%)',
];
const GradientColor = (props: {
  type: string;
  value: string | Object;
  onChange: (val: any) => void;
}) => {
  const { type, value, onChange } = props;
  const containterRef = useRef(null);
  const {
    editFlag,
    current,
    list,
    angle,
    background,
    initGradientDataByEffect,
    initGradientDataByBackground,
    deleteCurrent,
    getEffectColor,
    changeList,
    changeCurrent,
    changeColor,
    changeAngle,
  } = useGradientColor();
  const onChangeDeg = val => {
    changeAngle(val.angle);
  };
  const changeMockGradient = (item: string) => {
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };
  useMount(() => {
    if (value) {
      if (type === 'effect') {
        initGradientDataByEffect(value);
      }
      if (type === 'background') {
        initGradientDataByBackground(value);
      }
      if (type === 'svgEffect') {
        if (value?.colorStops) {
          initGradientDataByEffect(value);
        } else {
          initGradientDataByBackground(gradientMock[0]);
        }
      }
    }
  });
  useEffect(() => {
    if ((type === 'effect' || type === 'svgEffect') && list.length > 0) {
      const val = getEffectColor();
      onChange && val && onChange(val);
    }
  }, [editFlag]);

  return (
    <div className="gradient-color">
      {/* <div className="gradient-color-title">拾色器</div> */}
      <div className="gradient-picker-panel">
        <div className="gradient-picker-panel-picker" ref={containterRef}>
          <GradientPicker
            background={background}
            current={current}
            list={list}
            changeList={changeList}
            changeCurrent={changeCurrent}
            deleteCurrent={deleteCurrent}
          />
        </div>
        <Popover
          trigger="click"
          overlayClassName="gradient-picker-panel-deg"
          getPopupContainer={() => containterRef.current as HTMLElement}
          content={
            <>
              <DegPicker onChange={onChangeDeg} angle={angle} />
            </>
          }
          title=""
          placement="bottom"
          className="gradient-picker-panel-input"
        >
          {/* <Input
            suffix="°"
            value={angle}
            onPressEnter={e => {
              onChangeDeg({
                angle: e.target.value,
              });
            }}
          /> */}
          <div>{angle}°</div>
        </Popover>
      </div>
      <ColorPickup
        color={list[current]?.color || ''}
        onChange={(color: { rgb: {} }) => {
          changeColor(color.rgb);
        }}
      />
      {/* <div className="gradient-mock">
        {gradientMock.map(item => {
          return (
            <div
              key={item}
              style={{ backgroundImage: item }}
              className="gradient-mock-item"
              onClick={e => {
                e.stopPropagation();
                changeMockGradient(item);
              }}
            />
          );
        })}
      </div> */}
    </div>
  );
};
export default GradientColor;
