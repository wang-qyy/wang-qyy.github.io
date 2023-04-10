import { memo } from 'react';
import { flatten } from 'lodash-es';
import InfiniteLoader from '@/components/InfiniteLoader';
import { getUserImages } from '@/api/images';

import { handleAddAsset } from '@/utils/assetHandler';

import Content from './Content';

function ImageList({ uploadFile }: any) {
  function handleAdd(e: Event, data: any) {
    const params = {
      width: data.width,
      height: data.height,
      resId: data.id,
      picUrl: data.big_preview,
    };

    handleAddAsset({ meta: { type: 'pic' }, attribute: params });
  }

  return (
    <InfiniteLoader
      request={getUserImages}
      // beforeLoadData={params => params.page}
      wrapStyle={{ paddingLeft: 18, paddingBottom: 18 }}
    >
      {({ list }) => {
        return (
          <>
            {flatten([uploadFile, list]).map(item => (
              <Content key={item.id} onClick={handleAdd} item={item} />
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
}

export default memo(ImageList);
