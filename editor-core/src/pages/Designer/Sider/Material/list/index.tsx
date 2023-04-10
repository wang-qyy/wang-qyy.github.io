import { Input, Tooltip } from 'antd';
import React, { useState, ReactNode } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { LazyLoadComponent, XiuIcon } from '@/components';

import { stopPropagation } from '@/utils/single';
import MaterialMain from './component/Main';
import MaterialSearch from './component/Search';
import MaterialSinger from './component/Singer';
import styles from './index.modules.less';

interface MaterialItem {
  key: string;
  component?: (props?: any) => ReactNode;
}

const material: Array<MaterialItem> = [
  {
    key: 'main',
    component(props) {
      return <MaterialMain {...props} />;
    },
  },
  {
    key: 'search',
    component(props) {
      return <MaterialSearch {...props} />;
    },
  },
  {
    key: 'singer',
    component(props) {
      return <MaterialSinger {...props} />;
    },
  },
];
const MaterialList = () => {
  const [activeMenu, setActiveMenu] = useState('main');
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('png');
  const [tagObj, setTagObj] = useState(null);

  const onPressEnter = () => {
    setActiveMenu('search');
  };
  const onChange = e => {
    setSearch(e.target.value);
    setActiveMenu('search');
  };

  // 点击素材标签
  const bindClickTag = (obj: object | null) => {
    setTagObj(obj);
    setActiveMenu('singer');
  };
  const onCallBack = val => {
    if (activeMenu === 'main') {
      setTagObj(null);
      setSearchType(val);
      setActiveMenu('singer');
    } else {
      setSearch('');
      setActiveMenu('main');
    }
  };
  return (
    <div className={styles.material}>
      <div className={styles.materialHeader}>
        <Input
          className={styles.materialInput}
          value={search}
          placeholder="搜索您需要的素材"
          prefix={
            <XiuIcon
              type="iconshipinhaosousuo"
              style={{ color: 'rgba(39, 39, 49, 1)', fontSize: 15 }}
            />
          }
          suffix={
            ((search !== '' && activeMenu !== 'singer') ||
              activeMenu === 'search') && (
              <div
                className={styles.suffix}
                onClick={() => {
                  setSearch('');
                  setActiveMenu('main');
                }}
              >
                <CloseOutlined />
              </div>
            )
          }
          onChange={onChange}
          onPressEnter={onPressEnter}
          onKeyDown={stopPropagation}
        />
      </div>
      {material.map((item: MaterialItem) => {
        return (
          <LazyLoadComponent
            key={item.key}
            visible={activeMenu === item.key}
            className={styles.lazyLoad}
          >
            {item.component &&
              item.component({
                activeMenu,
                search,
                searchType,
                tagObj,
                eleType: '',
                onCallBack,
                bindClickTag,
              })}
          </LazyLoadComponent>
        );
      })}
    </div>
  );
};
export default MaterialList;
