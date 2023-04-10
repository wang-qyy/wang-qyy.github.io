import { memo, useRef, useState } from 'react';

import { useSetState } from 'ahooks';
import classNames from 'classnames';
import { filters, config } from '@/pages/SidePanel/Replace/config';

import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';
import { getMetaType } from '@/pages/SidePanel/Replace/Item';
import { ElementWrap } from '../../ElementWrap';
import styles from './index.less';
import AudioItem from '../../AudioItem';

type UploadFileListType = 'all' | 'image' | 'videoE' | 'element' | 'audio';

interface UploadFileListProps {
  type: UploadFileListType;
  params: any;
}

function getAddImgParams(fileInfo: any) {
  return {
    resId: fileInfo.id,
    width: fileInfo.width,
    height: fileInfo.height,
    picUrl: fileInfo.host + fileInfo.sample_big,
    rt_preview_url: fileInfo.host + fileInfo.sample_big,
    isUser: true,
  };
}
function getAddEleParams(fileInfo: any) {
  return {
    resId: fileInfo.id,
    width: fileInfo.width,
    height: fileInfo.height,
    picUrl: fileInfo.sample,
    rt_preview_url: fileInfo.preview,
    isUser: true,
  };
}
function getVideoParams(fileInfo: any) {
  return {
    resId: fileInfo.id,
    rt_url: fileInfo.sample,
    rt_preview_url: fileInfo.preview,
    rt_frame_url: fileInfo.frame_file,
    rt_total_frame: fileInfo.total_frame,
    rt_total_time: fileInfo.duration,
    width: fileInfo.width,
    height: fileInfo.height,
    volume: 60,
  };
}

const getAudioParams = (fileInfo: any) => {
  // console.log('fileInfo', fileInfo);

  return {};
};

export default function List(props: UploadFileListProps) {
  const { type, params } = props;
  const { request, formatResult, getAttribute } = config[type];
  const listRef = useRef<InfiniteLoaderRef>();
  const formatData = data => {
    switch (type) {
      case 'image':
        return getAddImgParams(data);
      case 'videoE':
        return getVideoParams(data);
      case 'element':
        return {
          ...getAddEleParams(data),
          ...getAttribute(data),
        };
      case 'audio':
        return getAudioParams(data);
    }
  };
  return (
    <div className={styles.listWarp}>
      <InfiniteLoader
        ref={listRef}
        formatResult={formatResult}
        request={request}
        wrapStyle={{ flex: 1 }}
        params={params}
        skeleton={{ rows: 3, columns: 3 }}
      >
        {({ list }) => {
          return (
            <div
              aria-label={type}
              className={styles.list}
              style={{ position: 'relative', height: '100%' }}
            >
              {list.map((item, index) => (
                <div key={item.id} className={styles.listItem}>
                  {type === 'audio' ? (
                    <AudioItem data={item} type="local" />
                  ) : (
                    <ElementWrap
                      operationShow={false} // 是否显示操作按钮
                      key={`uploader-${type}-${item.id}`}
                      type={getMetaType(item.asset_type) ?? type}
                      data={formatData(item)}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}
function List1(props: UploadFileListProps) {
  const { type, ...others } = props;
  return (
    <>
      <div className={styles.listWarp}>
        <InfiniteLoader
          {...others}
          formatResult={response => {
            return {
              list: type === 'image' ? response.data.list : response.data.items,
              pageTotal:
                type === 'image'
                  ? Math.ceil(response?.data.total / response?.data.pageSize)
                  : response?.data.pageTotal,
              page: Number(response.data.page),
            };
          }}
          skeleton={{ rows: 3, columns: 3 }}
        >
          {({ list }) => {
            return (
              <div
                aria-label={type}
                className={styles.list}
                style={{ position: 'relative', height: '100%' }}
              >
                {list.map((item, index) => (
                  <div key={item.id} className={styles.listItem}>
                    <ElementWrap
                      operationShow={false} // 是否显示操作按钮
                      key={`uploader-${type}-${item.id}`}
                      type={type}
                      data={
                        type === 'image'
                          ? getAddImgParams(item)
                          : getVideoParams(item)
                      }
                    />
                  </div>
                ))}
              </div>
            );
          }}
        </InfiniteLoader>
      </div>
    </>
  );
}

// export default memo(List);
