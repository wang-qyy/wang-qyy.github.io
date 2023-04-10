import { useLayoutEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import {
  createTemplateClass,
  addTemplateClass,
  addEmptyTemplate,
  CanvasInfo,
  initTemplate,
} from '@/kernel';

import { newAssetTemplate } from '@/kernel/utils/assetTemplate';

import { getScale } from '@/utils';
import { useGetImage, openErrorModal } from '@/hooks/initLoad';
import getUrlParams from '@/utils/urlProps';
import { formatRawData } from '@/utils/simplify';

import { setUrl } from '@/pages/store/canvas';
import { setTemplateInfo } from '@/pages/store/template';
import { getDraft } from '@/apis/global';
import { config } from '@/config/constants';
import templateMock from '@/mock/template';
import { openImgModal } from '@/pages/store/global';

import './index.less';

function testData() {
  return new Promise((rej) => {
    setTimeout(() => {
      rej({ code: 200, data: { online: 1, id: 1, doc: templateMock } });
    });
  });
}

export default function useCanvasInit() {
  const [size, setSize] = useState<CanvasInfo>();

  const { run } = useGetImage({
    onSuccess(res, params) {
      const { width, height, image_url, resId } = res.background;

      const template = createTemplateClass();

      const background = newAssetTemplate('image');

      const backgroundSize = { width: Number(width), height: Number(height) };

      Object.assign(background.meta, { isBackground: true });
      Object.assign(background.attribute, {
        ...backgroundSize,
        picUrl: image_url,
        resId,
      });
      setUrl(image_url);

      template.addAsset(background);

      const calcScale = getScale(backgroundSize);

      setSize({ ...backgroundSize, scale: calcScale });

      addTemplateClass(template, 0);
    },
  });

  const { run: getDraftInfo } = useRequest(getDraft, {
    manual: true,
    onSuccess(res) {
      setTemplateInfo(res.data);
      const canvasSize = {
        width: res.data.doc.width,
        height: res.data.doc.height,
      };
      const calcScale = getScale(canvasSize);

      setSize({ ...canvasSize, scale: calcScale });

      const rawData = formatRawData(res.data);
      initTemplate(rawData);
    },
  });

  useLayoutEffect(() => {
    const { pid, source_from, token, draft_id, w, h, model } = getUrlParams();

    if (config.is_designer === 1) {
      if (draft_id) {
        getDraftInfo({ draft_id, is_designer: config.is_designer });
      } else {
        const emptySize = { width: 276, height: 176 };
        addEmptyTemplate(1000);
        setSize({ ...emptySize, scale: getScale(emptySize) });
      }
    } else if (pid && source_from) {
      run({ pid, source_from, token });
    } else if (model == 'ppt') {
      const emptySize = { width: 276, height: 176 };
      addEmptyTemplate(1000);
      setSize({ ...emptySize, scale: getScale(emptySize) });
    } else if (w && h) {
      // 创建空白模板
      addEmptyTemplate(1000);

      const tempSize = {
        width: Number(w),
        height: Number(h),
        scale: getScale({ width: Number(w), height: Number(h) }),
      };

      setSize(tempSize);

      openImgModal(true);
    } else {
      openErrorModal();
    }
  }, []);

  return { size };
}
