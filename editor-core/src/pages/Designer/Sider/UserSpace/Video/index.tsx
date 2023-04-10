import { flatten } from 'lodash-es';
import InfiniteLoader from '@/components/InfiniteLoader';
import { getUserVideoE } from '@/api/images';
import { handleAddAsset } from '@/utils/assetHandler';

import Content from './Content';

export default function VideoEList({ uploadFile }: any) {
  function handleAdd(e: Event, data: any) {
    const attribute = {
      resId: data.id,
      rt_url: data.sample,
      rt_preview_url: data.preview,
      rt_frame_url: data.preview,
      rt_total_frame: data.total_frame,
      rt_total_time: data.duration,
      rt_frame_file: data.frame_file,
      width: data.width,
      height: data.height,
    };

    handleAddAsset({ meta: { type: 'videoE' }, attribute });
  }

  return (
    <InfiniteLoader
      request={getUserVideoE}
      // beforeLoadData={params => params.page}
      wrapStyle={{ paddingLeft: 18, paddingBottom: 18 }}
    >
      {({ list }) => {
        return (
          <>
            {flatten([uploadFile, list]).map(item => (
              <Content key={item.id} item={item} onClick={handleAdd} />
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
}
