import { useState } from 'react';

import { GradientColor, RGBA } from '@/kernel';

import {
  getBackgroundByData,
  getEffectGradientColor,
  getListByEffectGradientColor,
} from './util';

export const useGradientColor = (onChange?: (color: GradientColor) => void) => {
  const [background, setBackground] = useState('');
  const [current, setCurrent] = useState(0);
  const [list, setList] = useState<any[]>([]);
  const [color, setColor] = useState(0);
  const [angle, setAngle] = useState(0);
  const [editFlag, setEditFlag] = useState(false);

  const [colorType, _colorType] = useState<'radial' | 'linear'>('linear');

  function changeColorType(type: 'radial' | 'linear') {
    _colorType(type);
    setBackground(getBackgroundByData(list));
    changeList(list);
  }

  function changeList(tmpList: any) {
    setList(tmpList);
    setBackground(getBackgroundByData(tmpList));
    if (tmpList.length > 1) {
      setEditFlag(!editFlag);
    }
  }
  function setActiveIndex(index: number) {
    setCurrent(index);
  }
  function changeColor(color: RGBA) {
    if (list.length > 0) {
      const tempList = JSON.parse(JSON.stringify(list));
      if (tempList[current]) {
        tempList[current].color = color;
        setList(tempList);
      }
      setBackground(getBackgroundByData(tempList));
    }
  }
  function changeAngle(ang: number) {
    setAngle(ang);
    setBackground(getBackgroundByData(list));
    if (list.length > 1) {
      setEditFlag(!editFlag);
    }
  }
  function getEffectColor() {
    if (list.length > 0) {
      const deepCloneData = JSON.parse(JSON.stringify(list));
      deepCloneData.sort((a: any, b: any) => {
        return a.percent - b.percent;
      });
      return getEffectGradientColor(deepCloneData, angle, colorType);
    }
  }
  function deleteCurrent() {
    if (list.length > 2) {
      const tempList = JSON.parse(JSON.stringify(list));
      tempList.splice(current, 1);
      setList(tempList);
      setCurrent(tempList.length);
      setActiveIndex(0);
    }
  }
  // 根据特效字的效果，初始化数据
  function initGradientDataByEffect(effect: GradientColor) {
    const tmp = getListByEffectGradientColor(effect);
    setAngle(tmp.angle);
    setList(tmp.list);
    setBackground(getBackgroundByData(tmp.list));
    setColor(tmp.list[0].color);
  }

  return {
    editFlag,
    current,
    list,
    color,
    angle,
    background,
    setEditFlag,
    deleteCurrent,
    initGradientDataByEffect,
    getEffectColor,
    changeList,
    setActiveIndex,
    changeColor,
    changeAngle,
    _colorType: changeColorType,
    colorType,
  };
};
