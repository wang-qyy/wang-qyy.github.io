/* eslint-disable no-nested-ternary */
import { useState, memo, useEffect } from 'react';
import { Tabs } from 'antd';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { getTemplateList, getFavList, getDraftList } from '@/api/template';
import { clickActionWeblog } from '@/utils/webLog';
import { getTemplateInfo } from '@/store/adapter/useTemplateInfo';
import { getLocalStorage, setLocalstorageExtendStorage } from '@/utils/single';
import { useGuideInfo } from '@/store/adapter/useGlobalStatus';
import { NoviceGuide } from '@/pages/Help/Guide/variable';
import TemplatePart from '../TemplatePart';
import Search from './Search';
import Draft from './Draft';
import './index.less';

const { TabPane } = Tabs;

function Template() {
  const [templateBaseInfo, setTemplateBaseInfo] = useState();

  const [activeKey, setActiveKey] = useState('template');
  const { checkLoginStatus } = useCheckLoginStatus();

  const [isPart, setIsPart] = useState(false);

  const { ratioType } = getTemplateInfo();

  // 收藏选中的分类
  const [active, setactive] = useState(ratioType);
  // 草稿选中的分类
  const [draftActive, setDraftActive] = useState(ratioType);
  const { open: openAssetHandlerGuide } = useGuideInfo();

  function beforeReplace(info) {
    setTemplateBaseInfo(info);
    setIsPart(true);

    if (activeKey === 'draft') {
      // 调用草稿的埋点
      clickActionWeblog('action_template_draft');
    }
  }
  useEffect(() => {
    const localstorage = getLocalStorage('guide');
    if (!localstorage?.novice) {
      // 空白创建新手引导
      openAssetHandlerGuide(NoviceGuide[1][0]);
      setLocalstorageExtendStorage('guide', { novice: true });
    }
  }, []);
  return (
    <>
      <Tabs
        className="templatePanelTabs"
        activeKey={activeKey}
        destroyInactiveTabPane
        onChange={active => {
          setIsPart(false);
          setTemplateBaseInfo(undefined);

          clickActionWeblog(`panel_${active}`);
          if (active === 'collection' || active === 'draft') {
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
            tab: '模板',
            key: 'template',
            require: getTemplateList,
            searchShow: true,
          },
          {
            tab: '收藏',
            key: 'collection',
            require: getFavList,
            searchShow: false,
            active,
            setactive,
          },
          {
            tab: '草稿',
            key: 'draft',
            require: getDraftList,
            draftActive,
            setDraftActive,
          },
        ].map(item => {
          return (
            <TabPane tab={item?.tab} key={item?.key}>
              {item.key === 'draft' ? (
                <Draft request={getDraftList} beforeReplace={beforeReplace} />
              ) : (
                <Search
                  beforeReplace={beforeReplace}
                  request={item?.require}
                  type={item.key}
                />
              )}
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  zIndex: 30,
                  backgroundColor: '#f3f5f6',
                }}
                hidden={!isPart}
              >
                {templateBaseInfo && (
                  <TemplatePart
                    type={activeKey}
                    goBack={() => setIsPart(false)}
                    templateBaseInfo={templateBaseInfo}
                  />
                )}
              </div>
              {/* {!isPart ? (
                item.key === 'draft' ? (
                  <Draft request={getDraftList} beforeReplace={beforeReplace} />
                ) : (
                  <Search
                    beforeReplace={beforeReplace}
                    request={item?.require}
                    type={item.key}
                  />
                )
              ) : (
                <TemplatePart
                  type={activeKey}
                  goBack={() => setIsPart(false)}
                  templateBaseInfo={templateBaseInfo}
                />
              )} */}
            </TabPane>
          );
        })}
      </Tabs>
    </>
  );
}
export default memo(Template);
