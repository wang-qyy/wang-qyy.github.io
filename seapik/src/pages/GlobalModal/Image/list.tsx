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
import { handleReplaceAsset } from '@/utils/assetHandler/replace';

import IconFont from '@/components/Icon';
import imagesMock from '@/mock/images';
import { getScale } from '@/utils';
import { setUrl } from '@/pages/store/canvas';
import { openImgModal } from '@/pages/store/global';
import { getImagesList } from '@/apis/images';
import emptyImg from '@/assets/image/not-so.svg';
import image_list from '@/mock/image_list';

import './list.less';

// 列表测试接口
function testReq(params = { p: 1, pageSize: 30 }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(imagesMock);
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
    (res) => getImagesList({ p: res?.page ? res?.page + 1 : 1 }),
    {
      target: listRef,
      isNoMore: (res) => res?.pageTotal <= res?.page,
      reloadDeps: [keywords],
    },
  );

  // function replaceBg(image: any) {
  //   const currentTmp = getCurrentTemplate();

  //   if (currentTmp) {
  //     removeTemplate(currentTmp.id);

  //     buildAsset(image);
  //     openImgModal(false);
  //   }
  // }

  async function replaceBg(image: any) {
    await handleReplaceAsset({
      params: {
        meta: { type: 'image' },
        attribute: {
          width: image.width,
          height: image.height,
          picUrl: image.image_url,
          resId: image.resId,
        },
      },
    });

    openImgModal(false);
  }

  return (
    <Spin spinning={loading || loadingMore}>
      {/* <Input
        placeholder="Search image"
        onPressEnter={(e) => _keywords(e.target.value)}
        suffix={<IconFont type="iconsearch" />}
        allowClear
        onBlur={(e) => _keywords(e.target.value)}
      /> */}
      <div
        className="image-list"
        ref={listRef}
        style={{ height: 600, overflow: 'auto' }}
      >
        {[...image_list, ...(data?.list ?? [])]?.map((image) => {
          const rw = (Number(image.width) / Number(image.height)) * 150;
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
                <img src={image.img} />
              </div>
            </div>
          );
        })}
        {!loading && !loadingMore && !data?.list?.length && (
          <Empty
            image={<img src={emptyImg} />}
            description="No result found"
            style={{ width: '100%' }}
          />
        )}
      </div>
    </Spin>
  );
}
