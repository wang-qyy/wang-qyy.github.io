import { useRequest } from 'ahooks';
import { getTemplateInfo, designerGetTemplate } from '@/api/template';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';

import { useLoadError, BtnType } from '@/hooks/useLoadError';

// import type { RootState } from '@/store';

const errorCode = [-3, -4, 'ApCo-1'];

export default function useGetTemplate(
  onSuccess?: (res: any, params: any) => void,
  onError?: (e: Error) => void,
  shouldUpdata?: (res: any) => boolean,
) {
  const { templateInfo, updateTemplateInfo } = useTemplateInfo();
  const { open } = useLoadError();
  useLoadError();
  return useRequest(getTemplateInfo, {
    manual: true,
    onSuccess: (response, params) => {
      const { info, assets = [], stat, msg, ...res } = response;
      // console.log(response);
      if ([-3, -4].includes(stat)) {
        // 模板加载失败
        open('模板加载失败', msg);
        return;
      }
      if (stat === 'ApCo-1') {
        open('模板加载失败', msg, BtnType.reload);
        return;
      }
      // console.log(response);

      let picId;
      if (params[0].picId) {
        picId = info.id;
      }

      if (!shouldUpdata || shouldUpdata(response)) {
        updateTemplateInfo({ ...response, picId });
      }

      if (onSuccess) {
        onSuccess(response, params);
      }
    },
    onError: e => {
      if (onError) {
        onError(e);
      }
    },
  });
}

export function useGetDesignerTemplate(
  onSuccess?: (res: any) => void,
  onError?: (e: Error) => void,
) {
  const { templateInfo, updateTemplateInfo } = useTemplateInfo();

  const { open } = useLoadError();
  useLoadError();
  return useRequest(designerGetTemplate, {
    manual: true,
    onSuccess: (response, params) => {
      if (response) {
        const { info, assets, stat, msg, ...res } = response;
        // console.log(response);
        if (stat === -3) {
          // 模板加载失败
          open('模板加载失败', msg);
          return;
        }
        if (stat === 'ApCo-1') {
          // 模板数据获取异常
          return;
        }
        // console.log(response);

        let picId;
        if (params[0].picId) {
          picId = info.id;
        }

        if (!response.doc.canvas.height) {
          response.doc.canvas.height = 1080;
        }

        updateTemplateInfo({ ...response, picId });
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        open('模板加载失败', '');
      }
    },
    onError: e => {
      if (onError) {
        onError(e);
      }
    },
  });
}
