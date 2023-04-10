import { useRef, useState } from 'react';
import { useInfiniteScroll } from 'ahooks';
import { Input, Spin, Empty } from 'antd';
import {
  getCurrentTemplate,
  createTemplateClass,
  setCanvasInfo,
  addTemplateClass,
  removeTemplate,
} from '@/kernel';
import { newAssetTemplate } from '@/kernel/utils/assetTemplate';

import IconFont from '@/components/Icon';
import imagesMock from '@/mock/images';
import { getScale } from '@/utils';
import { setUrl } from '@/pages/store/canvas';
import { openImgModal } from '@/pages/store/global';

import './list.less';

function testReq(page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const list = imagesMock.slice(start, start + pageSize);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 200,
        list,
        page,
        pageTotal: Math.ceil(imagesMock.length / pageSize),
      });
    }, 1000);
  });
}

function buildAsset(img: any) {
  const { width, height, image_url, resId } = img;

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
  setCanvasInfo({ ...backgroundSize, scale: calcScale });

  addTemplateClass(template, 0);
}

export default function List() {
  const listRef = useRef<HTMLDivElement>(null);

  const [keywords, _keywords] = useState('');

  let { data, loading, loadMore, loadingMore, noMore } = useInfiniteScroll(
    (res) => testReq(res?.page ? res?.page + 1 : 1, 10),
    {
      target: listRef,
      isNoMore: (res) => res?.pageTotal <= res?.page,
      reloadDeps: [keywords],
    },
  );

  function replaceBg(image: any) {
    const currentTmp = getCurrentTemplate();

    if (currentTmp) {
      removeTemplate(currentTmp.id);

      buildAsset(image);
      openImgModal(false);
    }
  }

  return (
    <Spin spinning={loading || loadingMore}>
      <Input
        placeholder="Search image"
        onPressEnter={(e) => _keywords(e.target.value)}
        suffix={<IconFont type="iconsearch" />}
        allowClear
        onBlur={(e) => _keywords(e.target.value)}
      />
      <div
        className="image-list"
        ref={listRef}
        style={{ height: 600, overflow: 'auto' }}
      >
        {data?.list.map((image) => {
          const rw = (Number(image.width) / Number(image.height)) * 120;
          return (
            <div
              key={`image-${image.resId}`}
              className="image-item"
              style={{ flexGrow: rw, width: rw }}
              onClick={() => replaceBg(image)}
            >
              <div
                style={{
                  position: 'relative',
                  paddingTop: `${
                    (Number(image.height) / Number(image.width)) * 100
                  }%`,
                }}
              >
                <img src={image.image_url} />
              </div>
            </div>
          );
        })}
        {!loading && !loadingMore && !data?.list.length && (
          <Empty description="No result found" style={{ width: '100%' }} />
        )}
      </div>
    </Spin>
  );
}
