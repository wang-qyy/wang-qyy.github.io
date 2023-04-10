import { MouseEvent, useState } from 'react';
import { useRequest, useSetState } from 'ahooks';
import { message } from 'antd';
import {
  delFavTemplate,
  getNormalUserFavList,
  setFavTemplate,
} from '@/api/template';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';
import { useCurrentTemplate, setCurrentTime } from '@hc/editor-core';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import type { TemplateListItem } from './typing';

export const usePreviewModal = (getTemplate: (picId: string) => void) => {
  const { template } = useCurrentTemplate();

  const { pauseVideo } = useCanvasPlayHandler();

  const [state, setState] = useSetState({
    previewVisible: false,
    picId: '',
    videoSrc: '',
    modalWidth: 1080,
    duration: 0,
  });

  function onCancel() {
    setState({
      previewVisible: false,
      picId: '',
      videoSrc: '',
    });
  }

  function onOk(picId?: string, duration?: number) {
    pauseVideo();
    setCurrentTime(0);
    checkTotalTime({
      incrementalTime:
        (duration || state.duration) -
        (template?.videoInfo.allAnimationTime || 0),
      callback: exceed => {
        if (!exceed) {
          getTemplate(picId || state.picId);
          onCancel();
        }
      },
    });
  }

  function beforeReplace(Item: TemplateListItem) {
    const { id, host, small_url, pages } = Item;
    if (!template?.assets.length) {
      // 空场景添加模板不需要 preview
      onOk(id, Number(pages));
      return;
    }
    setState({
      previewVisible: true,
      picId: id,
      videoSrc: `${host}${small_url}`,
      duration: Number(pages),
    });
  }

  return {
    props: {
      onCancel,
      onOk,
      picId: state.picId,
      videoSrc: state.videoSrc,
      visible: state.previewVisible,
      width: state.modalWidth,
    },
    beforeReplace,
  };
};

export function useCollect() {
  const { checkLoginStatus } = useCheckLoginStatus();

  const [moduleFavList, setModuleFavList] = useState([{ id: -1 }]); // 收藏列表
  // 获取收藏列表
  const getNormalUserFavs = useRequest(getNormalUserFavList, {
    manual: true,
    onSuccess: res => {
      if (res.stat === 1) {
        setModuleFavList(res.msg);
      }
    },
  });
  // 添加收藏
  const setFav = useRequest(setFavTemplate, {
    manual: true,
    onSuccess: res => {},
  });

  // 取消收藏
  const delFav = useRequest(delFavTemplate, {
    manual: true,
    onSuccess: res => {},
  });

  // 收藏
  const beMyFav = async (
    e: MouseEvent<HTMLDivElement>,
    id: number | string,
    isFav: boolean,
  ) => {
    e.stopPropagation();

    if (checkLoginStatus()) return;

    const isAdd = isFav ? false : !moduleFavList.some(item => item.id === id);
    let response = { stat: -1, msg: '' };

    if (isAdd) {
      response = await setFav.run(id);
    } else {
      response = await delFav.run(id);
    }

    if (response.stat === 1) {
      setModuleFavList(prev =>
        isAdd ? [...prev, { id }] : prev?.filter(item => item.id !== id),
      );
      message.success(response.msg);
    } else {
      message.error(response.msg);
    }
  };

  return {
    moduleFavList,
    beMyFav,
    getNormalUserFavs,
  };
}
