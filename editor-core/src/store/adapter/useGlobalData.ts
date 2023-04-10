import { getTemplateClassify } from '@/api/template';
import { useAppDispatch, useAppSelector, globalDataAction } from '@/store';

export const useTemplateFilter = () => {
  const dispatch = useAppDispatch();
  const { globalData } = useAppSelector(store => ({
    globalData: store.globalData,
  }));

  const { templateFilter, templateFilterLoading } = globalData;

  // 如果数据已经请求过就不再调用接口
  if (!templateFilter && !templateFilterLoading) {
    dispatch(globalDataAction.setTemplateFilterLoading(true));
    getTemplateClassify()
      .then(data => {
        dispatch(globalDataAction.setTemplateFilter(data));
      })
      .finally(() => {
        dispatch(globalDataAction.setTemplateFilterLoading(false));
      });
  }

  return templateFilter;
};
