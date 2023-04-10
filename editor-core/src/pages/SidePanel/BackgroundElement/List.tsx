import classNames from 'classnames';
import { observer } from '@hc/editor-core';
import BackItem from './BackItem';

import './index.less';

interface BackgroundVideoListProps {
  list: any;
  type: string;
  shape: string;
  isSearch: boolean; // 是否搜索页面
}

function BackgroundVideoList(props: BackgroundVideoListProps) {
  const { list, type, shape = 'w', isSearch = false } = props;

  return (
    <>
      <div
        className={classNames('background-video-list', {
          'background-video-w': shape === 'w',
          'background-video-h': shape === 'h',
          'background-video-c': shape === 'c',
        })}
      >
        {list.map((item: any) => (
          <div key={item.gid} className="background-video-item">
            <BackItem type={type} data={item} isSearch={isSearch} />
          </div>
        ))}
      </div>
    </>
  );
}

export default observer(BackgroundVideoList);
