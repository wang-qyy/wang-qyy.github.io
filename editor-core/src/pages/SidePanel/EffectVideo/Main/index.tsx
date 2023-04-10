import LazyLoadComponent from '@/components/LazyLoadComponent';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { useState } from 'react';
import Recommend from './Recommend';
import More from './More';
import Search from './Search';
import styles from './index.modules.less';

export default function EffectVideoMain(props: {
  keyword: string;
  visible: boolean;
}) {
  const { keyword = '', visible } = props; // 搜索词
  const {
    leftSideInfo: { submenu },
  } = useLeftSideInfo();
  const [classId, setClassId] = useState('');
  const onChange = (val: string) => {
    setClassId(val);
  };
  return (
    <>
      {keyword && <Search keyword={keyword} class_id={classId} />}
      {/* 推荐列表 */}
      <LazyLoadComponent
        visible={!submenu && !keyword}
        className={styles['list-wrap']}
      >
        <Recommend onChange={onChange} />
      </LazyLoadComponent>
      {/* 更多 */}
      <LazyLoadComponent visible={Boolean(submenu && !keyword)}>
        <More />
      </LazyLoadComponent>
    </>
  );
}
