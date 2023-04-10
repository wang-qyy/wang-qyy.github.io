import {
  useTemplateLoadByObserver,
  getAllTemplates,
  observer,
} from '@hc/editor-core';
import { useMemo } from 'react';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';

export const useReplaceRemind = () => {
  const { templateInfo } = useTemplateInfo();

  const { loadComplete } = useTemplateLoadByObserver();

  const allAsset: any[] = [];

  const templatesAll = getAllTemplates();

  for (let index = 0; index < templatesAll.length; index++) {
    const element = templatesAll[index];
    for (let i = 0; i < element?.assets?.length; i++) {
      const ele = element?.assets[i].getAssetCloned();
      const obj = ele;
      obj.id = element.id;
      allAsset.push(obj);
    }
  }

  const { assetAll } = useMemo(() => {
    const assetArr: Array<number> = [];

    if (loadComplete) {
      templateInfo?.assets?.forEach(item => {
        if (!item.use_level) return;
        allAsset.forEach(ele => {
          if (ele.attribute.resId === item.resId) {
            assetArr.push(ele);
          }
        });
      });
    }
    return { assetAll: assetArr };
  }, [loadComplete, allAsset]);

  return {
    total: assetAll.length,
    data: assetAll,
  };
};
