import classNames from 'classnames';
import { observer } from 'mobx-react';
import { customConfig, assetBlur } from '@/kernel';
import { useMenu } from '@/pages/store/menu';
import Icon from '@/components/Icon';
import { cdnHost, hostName, fontsPath } from '@/config/urls';
import { initFontFamily } from '@/utils/fontHandler';
import { useSettingsPanel } from '@/pages/store/SettingsPanel';

import Main from './Main';
import Resource from './Aside/Resource';
import Setting from './Aside/Setting';

import Header from './Header';

import Menu from './Menu';
import './index.less';

customConfig({
  hostName,
  cdnHost,
  fontsPath,
  handImgSrc:
    '//js.xiudodo.com/xiudodo-editor/image/movie-writeText-animation.png',
  apis: {
    // params id
    getSpecificWord: '/apiv2/get-specific-word-info-new',
    getAeAnimationDetail: '/api-video/edit-video-asset-detail',
    getWebmFrameImage: '/video/small-frame-previews',
  },
  hpMode: false,
  wholeTemplate: true,
});

// initFontFamily();

function Layout() {
  const { open, openMenu } = useMenu();
  const { open: openSettings } = useSettingsPanel();

  return (
    <section className="layout">
      <header className="layout-header" onMouseDown={() => assetBlur()}>
        <Header />
      </header>
      <section className="layout-main">
        <aside className="layout-aside-menu">
          <Menu />
        </aside>
        {/* 左侧资源面板 */}
        <aside
          className={classNames('layout-aside', 'layout-aside-left', {
            'layout-aside-open': open,
          })}
        >
          <div className="layout-aside-content">
            <Resource />
          </div>
        </aside>
        {/* 右侧面板controller */}
        <div
          className={classNames('aside-panel-controller', {
            'aside-panel-controller-open': open,
          })}
          onClick={() => openMenu(!open)}
        >
          <div style={{ position: 'relative' }}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="14px"
              height="87px"
              viewBox="0 0 14 87"
            >
              <path
                fill="#FFF"
                d="M0,0l10.857,2.381C12.691,2.784,14,4.409,14,6.288v75.207c0,1.985-1.457,3.671-3.422,3.958L0,87 V0z"
              ></path>
            </svg>
            <Icon
              type="iconarrow"
              style={{ zIndex: 1 }}
              className="aside-panel-controller-arrow"
            />
          </div>
        </div>
        {/* 主画布 */}
        <Main />
        {/* 右侧设置面板 */}
        <aside
          className={classNames('layout-aside', 'layout-aside-right', {
            'layout-aside-right-open': openSettings,
          })}
        >
          <Setting />
        </aside>
      </section>
    </section>
  );
}

export default observer(Layout);
