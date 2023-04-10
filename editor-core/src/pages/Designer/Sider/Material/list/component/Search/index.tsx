import { Tabs } from 'antd';
import { useState, memo } from 'react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import styles from './index.modules.less';
import { MaterialTypeList, requestCatalogUrl } from '../../../constant';
import MaterialSearchContent from './materialSearchContent';

const { TabPane } = Tabs;

const MaterialSearch = (props: { search: string }) => {
  const { search } = props;
  const [type, setType] = useState('shape');

  const [screenShow, setScreenShow] = useState(false);

  return (
    <Tabs
      defaultActiveKey={type}
      onChange={setType}
      className={styles.searchPart}
      tabBarExtraContent={
        requestCatalogUrl[type].url && (
          <div
            className={styles.searchCatolag}
            onClick={() => {
              setScreenShow(!screenShow);
            }}
          >
            分类筛选
            {screenShow ? <CaretUpOutlined /> : <CaretDownOutlined />}
          </div>
        )
      }
    >
      {MaterialTypeList.map(item => (
        <TabPane tab={item.title} key={item.key}>
          <MaterialSearchContent
            type={item.key}
            tag={screenShow}
            search={search}
          />
        </TabPane>
      ))}
    </Tabs>
  );
};
export default memo(MaterialSearch);
