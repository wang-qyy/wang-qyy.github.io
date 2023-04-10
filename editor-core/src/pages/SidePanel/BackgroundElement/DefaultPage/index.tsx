import React, { useState, useEffect, useRef } from 'react';
import { Divider, Tabs, Dropdown, Menu } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { getCanvasShape } from '@/utils/templateHandler';
import { clickActionWeblog } from '@/utils/webLog';
import Recommend from './Recommend';
import SearchPage from './SearchPage';
import BackColor from './BackColor';
import styles from './index.less';

const { TabPane } = Tabs;

function DefaultPage(props: any) {
  const { keyword } = props;
  const [shape, _shape] = useState(getCanvasShape());
  const [img_filter_id, _img_filter_id] = useState('');
  const [video_filter_id, _video_filter_id] = useState('');
  const [activeKey, _activeKey] = useState('video');

  const bindClickTag = (id: string, type: string) => {
    if (type === 'VB') {
      _video_filter_id(id);
    } else {
      _img_filter_id(id);
    }
  };

  // 搜索埋点
  useEffect(() => {
    if (keyword) {
      clickActionWeblog('bgModule_001', { action_label: activeKey });
    }
  }, [keyword]);

  return (
    <div className={styles.defaultPage}>
      {!keyword && <BackColor />}
      {!keyword && <Divider className={styles.defaultPageDivider} />}
      <div className={styles.defaultPageContent}>
        <Tabs
          size="small"
          style={{ flex: 1 }}
          onChange={e => {
            const type = e === 'VB' ? 'video' : 'image';
            _activeKey(type);
            // 切换埋点 keyword区分推荐也还是搜索页
            const action_type = keyword ? 'bgModule_003' : 'bgModule_002';
            clickActionWeblog(action_type, { action_label: type });
          }}
          tabBarExtraContent={
            <Dropdown
              overlay={
                <Menu
                  selectedKeys={[shape]}
                  onClick={item => {
                    _shape(item.key);
                    // 切换横板：bgModule_004 切换竖版：bgModule_005 切换方形：bgModule_006
                    const action_type =
                      {
                        h: 'bgModule_005',
                        w: 'bgModule_004',
                        c: 'bgModule_006',
                      }[item.key] || 'bgModule_004';
                    clickActionWeblog(action_type, { action_label: activeKey });
                  }}
                >
                  <Menu.Item
                    key="h"
                    className={styles.defaultPageContentMenuItem}
                  >
                    竖版
                  </Menu.Item>
                  <Menu.Item
                    key="w"
                    className={styles.defaultPageContentMenuItem}
                  >
                    横版
                  </Menu.Item>
                  {/* <Menu.Item
                    key="c"
                    className={styles.defaultPageContentMenuItem}
                  >
                    方形
                  </Menu.Item> */}
                </Menu>
              }
            >
              <div style={{ cursor: 'pointer' }}>
                {{ h: '竖版', w: '横版', c: '方形' }[shape]}
                <CaretDownOutlined
                  className={styles.defaultPageContentTabIcon}
                />
              </div>
            </Dropdown>
          }
        >
          {[
            {
              name: '视频',
              key: 'VB',
            },
            {
              name: '图片',
              key: 'GP',
            },
          ].map(item => {
            return (
              <TabPane tab={item.name} key={item.key}>
                {keyword ? (
                  <SearchPage
                    bindClickTag={bindClickTag}
                    params={
                      item.key === 'VB'
                        ? {
                            keyword,
                            filter_id: video_filter_id,
                            resource_flag: item.key,
                            shape,
                          }
                        : {
                            keyword,
                            filter_id: img_filter_id,
                            resource_flag: item.key,
                            shape,
                          }
                    }
                    type={item.key}
                  />
                ) : (
                  <Recommend type={item.key} shape={shape} />
                )}
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

export default DefaultPage;
