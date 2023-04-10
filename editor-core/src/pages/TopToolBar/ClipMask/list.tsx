import { observer } from '@hc/editor-core';

import InfiniteLoader from '@/components/InfiniteLoader';

import { getMaskList } from '@/api/pictures';
import ClipMaskItem from './ClipMaskItem';
import './index.less';

const ClipMaskList = () => {
  return (
    <InfiniteLoader
      request={getMaskList}
      beforeLoadData={params => params.page}
      wrapStyle={{
        height: 293,
        padding: '10px 0 10px 10px',
      }}
    >
      {({ list }) => {
        return (
          <div className="clip-mask-list">
            {list.map(item => (
              <ClipMaskItem item={item} key={item.id} />
            ))}
          </div>
        );
      }}
    </InfiniteLoader>
  );
};

export default observer(ClipMaskList);
