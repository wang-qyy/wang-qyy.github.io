import { useState, useEffect } from 'react';
import {
  getBackgroundByData,
  getEffectGradientColor,
  getdataByBackground,
  getListByEffectGradientColor,
} from './util';

export const useGradientColor = () => {
  const [background, setBackground] = useState('');
  const [current, setCurrent] = useState(0);
  const [list, setList] = useState([]);
  const [color, setColor] = useState(0);
  const [angle, setAngle] = useState(0);
  const [editFlag, setEditFlag] = useState(false);
  function changeList(tmpList: any) {
    setList(tmpList);
    setBackground(getBackgroundByData(tmpList));
    if (tmpList.length > 1) {
      setEditFlag(!editFlag);
    }
  }
  function changeCurrent(index: number) {
    setCurrent(index);
  }
  function changeColor(c: any) {
    if (list.length > 0) {
      const tempList = JSON.parse(JSON.stringify(list));
      if (tempList[current]) {
        tempList[current].color = c;
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
      return getEffectGradientColor(deepCloneData, angle);
    }
  }
  function deleteCurrent() {
    if (list.length > 2) {
      const tempList = JSON.parse(JSON.stringify(list));
      tempList.splice(current, 1);
      setList(tempList);
      setCurrent(tempList.length);
    }
  }
  // 根据特效字的效果，初始化数据
  function initGradientDataByEffect(effect: any) {
    const tmp = getListByEffectGradientColor(effect);
    setAngle(tmp.angle);
    setList(tmp.list);
    setBackground(getBackgroundByData(tmp.list, effect.angle));
    setColor(tmp.list[0].color);
  }
  // 根据背景颜色的效果，初始化数据
  function initGradientDataByBackground(val: string) {
    const tmp = getdataByBackground(val);
    changeAngle(tmp.angle);
    setList(tmp.list);
    setBackground(val);
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
    initGradientDataByBackground,
    getEffectColor,
    changeList,
    changeCurrent,
    changeColor,
    changeAngle,
  };
};
