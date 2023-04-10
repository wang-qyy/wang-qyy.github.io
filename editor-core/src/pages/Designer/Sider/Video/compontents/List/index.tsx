import { memo, useEffect, useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { XiuIcon } from '@/components';
import InfiniteLoader from '@/components/InfiniteLoader';
import { getVideoClassify } from '@/api/video';
import Tag from '@/pages/Designer/Sider/components/Tag';

import Item from './Item';
import styles from './index.modules.less';

const ratioOptions = [
  { value: -1, label: '全部' },
  { value: 1, label: '横' },
  { value: 2, label: '竖' },
  { value: 0, label: '方' },
];

const List = (Props: {
  param: { type: 'sp' | 'bg' | 'tx'; keyword?: string };
  title: string;
  req: (params: any) => Promise<any>;
  className?: string;
}) => {
  const { param, title, req } = Props;

  const [ratio, setRatio] = useState(-1);
  const [classifyId, setClassifyId] = useState('');
  const [allClassify, setAllClassifyId] = useState(false);

  const { run, data = [] } = useRequest(getVideoClassify, {
    manual: true,
  });

  useEffect(() => {
    if (['bg', 'sp'].includes(param.type)) {
      run({ type: param.type });
    }
  }, []);

  const classifyTags = useMemo(() => {
    return allClassify ? data : data.slice(0, 3);
  }, [allClassify, data]);

  return (
    <>
      <div
        className={styles['classify-tags-wrap']}
        hidden={!classifyTags.length}
      >
        <div className={styles['classify-label']}>分类：</div>
        <div className={styles['classify-tags']}>
          <Tag
            label="全部"
            active={!classifyId}
            onClick={() => setClassifyId('')}
          />

          {classifyTags?.map(item => (
            <Tag
              key={item.id}
              label={item.class_name}
              active={classifyId === item.id}
              onClick={() => setClassifyId(item.id)}
            />
          ))}
          <Tag
            label={allClassify ? '收起' : '查看全部'}
            onClick={() => setAllClassifyId(!allClassify)}
          />
        </div>
      </div>

      <div className={styles['classify-tags-wrap']}>
        <div className={styles['classify-label']}>版式：</div>
        <div className={styles['classify-tags']}>
          {ratioOptions.map(item => (
            <Tag
              key={item.value}
              label={item.label}
              active={ratio === item.value}
              onClick={() => setRatio(item.value)}
            />
          ))}
        </div>
      </div>

      <InfiniteLoader
        request={req}
        params={{ ...param, class_id: classifyId, ratio }}
        emptyDesc={
          <div className={styles.emptyWarp}>
            <XiuIcon type="iconkong" className={styles.img} />
            {`未搜索到${
              param?.keyword ? `与“${param?.keyword}”` : ''
            }相关${title}`}
          </div>
        }
        skeleton={{ className: styles.list }}
      >
        {({ list }) => {
          return (
            <>
              {list.map(item => (
                <div className={styles.item} key={item.id}>
                  <Item item={item} />
                </div>
              ))}
            </>
          );
        }}
      </InfiniteLoader>
    </>
  );
};

export default memo(List);
