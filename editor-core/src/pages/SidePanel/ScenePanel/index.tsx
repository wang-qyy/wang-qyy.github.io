/* eslint-disable no-nested-ternary */
import { useState, memo } from 'react';
import { Tabs } from 'antd';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { getTemplateSingleList, getFavList } from '@/api/template';
import { clickActionWeblog } from '@/utils/webLog';
import { getTemplateInfo } from '@/store/adapter/useTemplateInfo';
import Search from './Search';
import './index.less';

const { TabPane } = Tabs;
const { ratioType } = getTemplateInfo();

function ScenePanel() {
  const [activeKey, setActiveKey] = useState('all');
  const { checkLoginStatus } = useCheckLoginStatus();

  // 收藏选中的分类
  const [active, setactive] = useState(ratioType);

  return (
    <>
      <Tabs
        className="scenePanelTabs"
        activeKey={activeKey}
        destroyInactiveTabPane
        onChange={active => {
          clickActionWeblog(`panel_${active}`);
          if (active === 'collection') {
            const loginStatus = checkLoginStatus();
            if (loginStatus) {
              return;
            }
            setActiveKey(active);
          } else {
            setActiveKey(active);
          }
        }}
      >
        {[
          {
            tab: '全部',
            key: 'all',
            require: getTemplateSingleList,
            searchShow: true,
          },
          // {
          //   tab: '收藏',
          //   key: 'collection',
          //   require: getFavList,
          //   searchShow: false,
          //   active,
          //   setactive,
          // },
        ].map(item => {
          return (
            <TabPane tab={item?.tab} key={item?.key}>
              <Search request={item?.require} type={item.key} />
            </TabPane>
          );
        })}
      </Tabs>
    </>
  );
}
export default memo(ScenePanel);
