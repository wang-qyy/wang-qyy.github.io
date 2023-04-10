import { useMemo, useState } from 'react';

const EDITOR_CONFIG = 'EDITOR_CONFIG';

export interface ConfigType {
  // 模板片段默认替换 ,否则是添加
  modulePartForAdd: boolean;
  // 所有模板片段默认替换 ,否则是添加
  allModulePartForAdd: boolean;
  // 模板片段默认替换 ,否则是添加
  moduleForAdd: boolean;
}

function getAllConfig() {
  return localStorage.getItem(EDITOR_CONFIG) || '{}';
}
export function getConfig(configType: keyof ConfigType) {
  const config = getAllConfig();
  return JSON.parse(config)[configType] || false;
}

function setConfig(configType: keyof ConfigType, result: boolean) {
  const config = getAllConfig();
  const newConfig = JSON.parse(config);
  newConfig[configType] = result;
  localStorage.setItem(EDITOR_CONFIG, JSON.stringify(newConfig));
}

export default function useEditorConfig(configType: keyof ConfigType) {
  const [state, setState] = useState(getConfig(configType));

  return {
    state,
    getConfig: () => getConfig(configType),
    setConfig: () => {
      setConfig(configType, state);
    },
    setState: (data: boolean) => {
      setState(data);
    },
  };
}
