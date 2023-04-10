import { useState, useEffect, memo } from 'react';
import { useRequest } from 'ahooks';
import { getCatalogList } from '@/api/material';
import Tag from '@/pages/Designer/Sider/components/Tag';

import styles from './index.modules.less';

const SearchCatalog = (props: {
  type: string;
  tag: string;
  changeTag: (val: string) => void;
}) => {
  const { type, tag, changeTag } = props;
  const [isShow, setIsShow] = useState(false);

  const { data = [], run: getList } = useRequest(getCatalogList, {
    manual: false,
    onError() {},
  });
  const showData = !isShow && data.length > 5 ? data.slice(0, 4) : data;

  useEffect(() => {
    getList({ type });
  }, [type]);

  return (
    <>
      {data.length > 0 && (
        <div className={styles.searchCatalogView}>
          <Tag label="全部" onClick={() => changeTag('')} active={tag === ''} />

          {showData.map(item => {
            return (
              <Tag
                key={item.id}
                label={item.tagname || item.class_name}
                onClick={() => changeTag(item.id)}
                active={tag === item.id}
              />
            );
          })}
          {data.length > 5 && (
            <Tag
              label={!isShow ? '查看全部' : '收起'}
              onClick={() => setIsShow(!isShow)}
            />
          )}
        </div>
      )}
    </>
  );
};
export default memo(SearchCatalog);
