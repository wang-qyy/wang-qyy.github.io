import { getAllTemplates } from '@/kernel';

import conciseModeStore from './index';

export const getActiveTemplate = () => {
  const templates = getAllTemplates();
  // const {  } = conciseModeStore;
};

export const getResAssets = () => {
  const { resAssets } = conciseModeStore;
  return resAssets;
};
