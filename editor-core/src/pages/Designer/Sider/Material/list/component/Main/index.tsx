import { ReactNode, useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { getMaterialList, getLabelList } from '@/api/material';
import { formater } from '@/pages/Designer/Sider/Material/formater';
import MaterialItem from '@/pages/Designer/Sider/components/MaterialItem';
import Mold from '@/pages/Designer/Sider/components/Mold';
import { MaterialTypeList } from '../../../constant';

import styles from './index.modules.less';

interface typeProps {
  key: string;
  mapKey: string;
  title: string | ReactNode;
}

const MoreCmp = (props: any) => {
  return (
    <div className={styles.moreCmp} {...props}>
      查看更多&gt;
    </div>
  );
};
const MaterialMain = (props: any) => {
  const { onCallBack, bindClickTag } = props;
  const { data } = useRequest(getMaterialList);
  const [tagArr, settagArr] = useState([]);
  const tagColor = ['#31BD80', '#3F73FF', '#2BAEFB', '#FA802C'];

  // 获取元素标签列表
  useEffect(() => {
    getLabelList().then(res => {
      if (res?.code === 0) {
        settagArr(res?.data);
      }
    });
  }, []);
  return (
    <div
      style={{
        overflowY: 'auto',
        padding: '0 14px 0px 20px',
        height: '100%',
      }}
    >
      <div className={styles.tabWarp}>
        {tagArr.map(
          (
            item: { id: string; class_name: string; asset_type: string },
            index,
          ) => {
            return (
              <div
                className={styles.tabItem}
                key={item.id}
                style={{ background: tagColor[index] }}
                onClick={() => bindClickTag(item)}
              >
                {item.class_name}
              </div>
            );
          },
        )}
      </div>
      <div className={styles.main}>
        {data &&
          MaterialTypeList.map((item: typeProps) => {
            return (
              <Mold
                key={item.key}
                title={item.title}
                extraContent={
                  <MoreCmp
                    onClick={() => {
                      onCallBack(item.key);
                    }}
                  />
                }
                contentStyle={{
                  gridTemplateColumns: 'repeat(auto-fill,minmax(98px,1fr))',
                }}
              >
                {(data[item.key]?.items || []).map(
                  (ele: any, index: number) => {
                    if (index > 3 && item.key === 'icon') {
                      return <></>;
                    }

                    return (
                      <MaterialItem
                        {...formater(ele, item.key)}
                        key={ele.id}
                        style={{ width: 'auto', height: 100 }}
                        src={ele[item.mapKey]}
                        poster={ele.preview}
                      />
                    );
                  },
                )}
              </Mold>
            );
          })}
      </div>
    </div>
  );
};
export default MaterialMain;
