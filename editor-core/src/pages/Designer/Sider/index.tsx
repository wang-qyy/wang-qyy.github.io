import { ReactNode, useMemo } from 'react';
import 'overlayscrollbars/css/OverlayScrollbars.css';

import useDeepCompareEffect from '@/components/InfiniteLoader/useDeepCompareEffect';
import XiuIcon from '@/components/XiuIcon';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import {
  useGetCurrentInfoByObserver,
  isModuleType,
  observer,
  AssetClass,
  AssetType,
  assetBlur,
  isTempModuleType,
  useCurrentTemplate,
  toJS,
  getCurrentTemplate,
} from '@hc/editor-core';

import ModuleTab from '@/pages/Designer/Sider/Module';
import { useSetActiveMenu } from '@/store/adapter/useDesigner';
import { stopPropagation } from '@/utils/single';
import { useSetActiveAudio, audioBlur } from '@/store/adapter/useAudioStatus';

import Text from './Text';
import TextTabs from './Text/TextTabs';
import UserSpace from './UserSpace';
import Background from './Background';
import Music from './Music';

import Role from './Role';

import RoleMore from './Role/RoleMore';

import Material from './Material';
import AssetController from './AssetController';
import EffectEdit from './EffectEdit';
import Images from './Images';
import Video from './Video';
import EffectPanel from './EffectPanel';
import AudioController from './AudioController';
import UploadV2 from './UploadV2';
import Transition from './TemplateController/Transition';
import styles from './index.modules.less';

interface MenuItem {
  key: string;
  name?: string;
  icon?: string;
  component?: (props?: any) => ReactNode;
  hideInMenu?: boolean;
  includeTypes?: AssetType[];
}

const menus: Array<MenuItem> = [
  {
    key: 'background',
    name: '背景',
    icon: 'iconbackground',
    component(props) {
      return <Background {...props} />;
    },
  },
  {
    key: 'text',
    name: '文字',
    icon: 'iconwenzi1',
    component(props) {
      return <Text {...props} />;
    },
  },
  {
    key: 'music',
    name: '音乐',
    icon: 'iconyinle2',
    component(props) {
      return <Music {...props} />;
    },
  },
  {
    key: 'material',
    name: '素材',
    icon: 'iconyuansu1',
    component(props) {
      return <Material />;
    },
  },
  {
    key: 'images',
    name: '图片',
    icon: 'iconzhaopian',
    component(props) {
      return <Images {...props} />;
    },
  },
  {
    key: 'video',
    name: '视频',
    icon: 'iconshipin1',
    component(props) {
      return <Video {...props} />;
    },
  },
  {
    key: 'effect',
    name: '视频滤镜',
    icon: 'lvjing',
    component(props) {
      return <EffectPanel {...props} />;
    },
  },
  {
    key: 'role',
    name: '角色',
    icon: 'iconshipinhaowode',
    component(props) {
      return <Role {...props} />;
    },
  },
  {
    key: 'role-more',
    name: 'effect',
    hideInMenu: true,
    component(props) {
      return <RoleMore {...props} />;
    },
  },
  // {
  //   key: 'user',
  //   name: '我的',
  //   icon: 'iconant-design_cloud-upload-outlined',
  //   component(props) {
  //     return <UserSpace {...props} />;
  //   },
  // },
  {
    key: 'user',
    name: '我的',
    icon: 'iconant-design_cloud-upload-outlined',
    component(props) {
      return <UploadV2 {...props} />;
    },
  },
  // {
  //   key: 'effect-text-more',
  //   name: 'effect',
  //   hideInMenu: true,
  //   component(props) {
  //     return <>更多特效字</>;
  //   },
  // },
  // {
  //   key: 'animation-text-more',
  //   name: 'effect',
  //   hideInMenu: true,
  //   component(props) {
  //     return <>更多动效字</>;
  //   },
  // },
  {
    // 文字设置面板
    key: 'textEdit',
    includeTypes: ['text'],
    name: 'effect',
    hideInMenu: true,
    component() {
      return <TextTabs />;
    },
  },
  {
    key: 'materialEdit',
    name: 'effect',
    includeTypes: ['SVG', 'image', 'lottie', 'pic', 'mask', 'video', 'videoE'],
    hideInMenu: true,
    component() {
      return <AssetController />;
    },
  },
  {
    key: 'effectEdit',
    name: 'effect',
    includeTypes: ['effect'],
    hideInMenu: true,
    component() {
      return <EffectEdit />;
    },
  },
  {
    key: 'moduleEdit',
    name: 'module',
    includeTypes: ['module', '__module'],
    hideInMenu: true,
    component() {
      return <ModuleTab />;
    },
  },
  {
    key: 'audioController',
    name: 'audioController',
    includeTypes: [],
    hideInMenu: true,
    component() {
      return <AudioController />;
    },
  },
  {
    key: 'transition',
    name: '转场',
    includeTypes: [],
    hideInMenu: true,
    component() {
      return <Transition />;
    },
  },
];

function filterActiveKey(asset: AssetClass) {
  const item = menus.filter(data =>
    data.includeTypes?.includes(asset.meta.type),
  )[0];
  return item?.key || '';
}

const Sider = observer(() => {
  const { activeAudio } = useSetActiveAudio();
  const {
    activeMenu,
    setActiveMenu,
    activeSubMenu,
    setActiveSubMenu,
    activeOperationMenu,
    setActiveOperationMenu,
  } = useSetActiveMenu();
  const { currentAsset, moduleItemActive, multiSelect } =
    useGetCurrentInfoByObserver();

  // const [menuActiveBgTop, setMenuActiveBgTop] = useState(
  //   document.getElementById(`designer-text`)?.offsetTop || 0,
  // );
  useDeepCompareEffect(() => {
    let activeSubKey = '';
    if (multiSelect?.length > 1 || isModuleType(currentAsset)) {
      if (
        multiSelect?.length > 1 &&
        multiSelect[0]?.template?.id !== getCurrentTemplate()?.id
      ) {
        // TODO: 若多选元素非当前片段，则禁止成组，因为临时组是与当前片段绑定的
      } else {
        // 如果子元素中有module，则不再允许继续成组
        if (multiSelect.every(asset => !isModuleType(asset))) {
          if (moduleItemActive) {
            activeSubKey = filterActiveKey(moduleItemActive);
          } else {
            activeSubKey = 'moduleEdit';
          }
        }
      }
    } else if (currentAsset && !isTempModuleType(currentAsset)) {
      activeSubKey = filterActiveKey(currentAsset);
    } else if (activeAudio) {
      activeSubKey = 'audioController';
    }

    setActiveOperationMenu(activeSubKey);
  }, [currentAsset?.meta.id, moduleItemActive, multiSelect, activeAudio]);

  const menuActiveBgTop = useMemo(() => {
    return (
      document.getElementById(`designer-${activeSubMenu || activeMenu}`)
        ?.offsetTop || 0
    );
  }, [activeMenu, activeSubMenu]);

  return (
    <div
      className={styles['xiudodo-designer-aside']}
      // onKeyDown={e => stopPropagation(e)}
    >
      <div className={styles['side-menu']}>
        {menus.map(menu => (
          <div
            hidden={menu.hideInMenu}
            key={menu.key}
            id={`designer-${menu.key}`}
            className={styles['menu-item']}
            onMouseDown={() => {
              assetBlur();
              audioBlur();
              setActiveMenu(menu.key);
              setActiveSubMenu('');
            }}
          >
            {menu.icon && <XiuIcon type={menu.icon} className={styles.icon} />}
            <span>{menu.name}</span>
          </div>
        ))}

        {!activeOperationMenu && (
          <div
            className={styles['menu-item-active-background']}
            style={{ top: menuActiveBgTop }}
          />
        )}
      </div>
      <div className={styles['side-panel']}>
        {menus.map(menu => (
          <LazyLoadComponent
            key={menu.key}
            visible={
              activeOperationMenu
                ? activeOperationMenu === menu.key
                : activeSubMenu
                ? activeSubMenu === menu.key
                : activeMenu === menu.key
            }
          >
            {menu.component &&
              menu.component({
                keyName: menu.key,
                getMore: ['background', 'music', 'material', 'images'].includes(
                  menu.key,
                )
                  ? setActiveSubMenu
                  : setActiveOperationMenu,
                className: '',
              })}
          </LazyLoadComponent>
        ))}
      </div>
    </div>
  );
});

export default Sider;
