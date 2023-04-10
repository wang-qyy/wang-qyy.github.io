import { getAssetList } from '@/api/material';
import { requestUrl } from '../../../constant';
import List from '../Search/materialSearchContent';
import styles from './index.modules.less';

const MaterialSinger = (props: any) => {
  const { searchType, tagObj, onCallBack } = props;

  return (
    <div className={styles.singer}>
      <div className={styles.header}>
        <span className={styles.moldTitle}>
          {tagObj?.class_name || requestUrl[searchType].title}
        </span>
        <span className={styles.goback} onClick={() => onCallBack(searchType)}>
          {'<'}返回
        </span>
      </div>

      <List
        type={tagObj?.asset_type || searchType}
        tag={requestUrl[searchType].url}
        request={tagObj?.asset_type && getAssetList}
        class_id={tagObj?.id}
      />
    </div>
  );
};
export default MaterialSinger;
