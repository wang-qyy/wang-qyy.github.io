import { memo } from 'react';
import { useSetState } from 'ahooks';
import { Tabs, Radio } from 'antd';

import { clickActionWeblog } from '@/utils/webLog';

import Search from '@/components/Search';
import { assetList } from '@/api/pictures';
import ImgList from '@/pages/SidePanel/CloudImg/ImgList/List';
import styles from './index.less';

const { TabPane } = Tabs;

const filters = [
  {
    key: 'isPortrait',
    label: '人像',
    type: 'radio',
    options: [
      { value: 0, label: '全部' },
      { value: 1, label: '有' },
      { value: 2, label: '无' },
    ],
  },
];

interface State {
  kid: string;
  isHot: number | string;
  isNew: number | string;
  isElite: number;
  keyword: string;
  isPortrait: number;
  page: number;
}
const TabItem = () => {
  const [state, setState] = useSetState<State>({
    kid: '20,2,66',
    isHot: '',
    isNew: '',
    isElite: 0,
    keyword: '',
    isPortrait: 0,
    page: 1,
  });

  const { isElite, kid, isNew } = state;

  // 切换tab
  const callback = (e: any) => {
    if (e === 'isNew') {
      setState({ isNew: 1, isHot: 0 });
    } else {
      setState({ isNew: 0, isHot: 1 });
    }

    clickActionWeblog(`panel_img_${kid}_${e}`);
  };

  const callbackTop = (key: string) => {
    setState({ kid: key });
    clickActionWeblog(`panel_img_${key}`);
  };

  return (
    <div className={styles.CloudImg}>
      <Tabs
        onChange={callbackTop}
        activeKey={kid}
        style={{ height: 44, flex: '0 0 auto' }}
      >
        <TabPane tab="全部" key="20,2,66" />
        <TabPane tab="创意背景" key="2" />
        <TabPane tab="插画" key="66" />
        <TabPane tab="照片" key="20" />
      </Tabs>
      <Search
        searchKey="keyword"
        placeholder="搜索图片"
        filters={filters}
        onChange={setState}
        onFilter={setState}
        defaultValue={{ isPortrait: 0 }}
      />
      <Tabs
        defaultActiveKey="1"
        onChange={callback}
        size="small"
        activeKey={isNew ? 'isNew' : 'isHot'}
        style={{ flex: 1 }}
        tabBarExtraContent={
          <div>
            <Radio
              checked={isElite === 1}
              onClick={() => {
                const newIsElite = isElite === 1 ? 0 : 1;
                setState({ isElite: newIsElite });
              }}
            >
              <span className={styles.radioSpan}>精品</span>
            </Radio>
          </div>
        }
      >
        <TabPane tab="热门" key="isHot">
          <ImgList requests={assetList} param={state} />
        </TabPane>
        <TabPane tab="最新" key="isNew">
          <ImgList requests={assetList} param={state} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default memo(TabItem);
