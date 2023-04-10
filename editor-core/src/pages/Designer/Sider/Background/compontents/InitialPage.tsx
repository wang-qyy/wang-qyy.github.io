import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { getBackgroundImage } from '@/api/background';

import getUrlParams from '@/utils/urlProps';

import { useGetBackgroundAsset } from '@hc/editor-core';
import ColorBackground from './common/ColorBackground';
import styles from './index.less';
import SimpleShow from './common/SimpleShow';

const isModule = getUrlParams().redirect === 'module';

const InitialPage = (Props: {
  bindClickMore: (title: string, type: any) => void;
  videoArr: Array<object>;
  imageArr: Array<object>;
}) => {
  const { bindClickMore, videoArr, imageArr } = Props;

  const { data = { items: [] }, run } = useRequest(getBackgroundImage, {
    manual: true,
  });

  useEffect(() => {
    if (isModule) {
      run({ type: 'module' });
    }
  }, []);
  return (
    <div className={styles.initialPageWarp}>
      <ColorBackground />
      {isModule && (
        <SimpleShow
          title="组件背景"
          bindClickMore={() => bindClickMore('组件背景', 'background')}
          data={data.items}
          type="background"
        />
      )}

      <SimpleShow
        title="视频背景"
        bindClickMore={() => bindClickMore('视频背景', 'video')}
        data={videoArr}
        type="video"
      />

      <SimpleShow
        title="图片背景"
        bindClickMore={() => bindClickMore('图片背景', 'pic')}
        data={imageArr}
        type="pic"
      />
    </div>
  );
};

export default InitialPage;
