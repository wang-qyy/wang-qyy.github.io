import oneKeyReplaceStore from './index';

export const getOneReplaceList = () => {
  const { resAssets } = oneKeyReplaceStore;
  return resAssets;
};
