import {
  useLineHeightByObserver,
  useLetterSpacingByObserver,
  useOpacityByObserver,
  useGetCurrentAsset,
  observer,
  toJS,
} from '@hc/editor-core';
import { ReactNode } from 'react';

import TextColor from '../../TextTabs/Basic/components/TextColor';

import DesignerFontFamily from './components/FontFamilyDesiger/index';
import FontSizeDesiger from './components/FontSize/index';
import FontStyle from './components/FontStyle/index';
import TextAlign from './components/TextAlign/index';
import SliderText from './components/SliderText/index';
import styles from './index.modules.less';

import EffectMachine from './components/EffectMachine';
import GradientColor from '../../GradientColor';
import BackgroundFont from './components/BackgroundFont';

interface BasicItemProps {
  name: string;
  component: string | ReactNode;
}
const BasicItem = (props: BasicItemProps) => {
  const { name, component } = props;
  return (
    <div className={styles.basicItem}>
      <div className={styles.basicItemTitle}>{name}</div>
      <div className={styles.basicItemView}>{component}</div>
    </div>
  );
};

function TextBasic() {
  const [opacity, updateOpacity] = useOpacityByObserver();
  const [lineHeight, updateLineHeight] = useLineHeightByObserver();
  const [letterSpacing, updateLetterSpacing] = useLetterSpacingByObserver(); // 字间距
  const currentAsset = useGetCurrentAsset();

  const basicList = [
    {
      name: '字体',
      key: 'fontFamaily',
      isShow: true,
      component: <DesignerFontFamily />,
    },
    {
      name: '大小',
      key: 'fontSize',
      isShow: true,
      component: <FontSizeDesiger />,
    },
    {
      name: '样式',
      key: 'fontStyle',
      isShow: true,
      component: <FontStyle />,
    },
    {
      name: '排列',
      key: 'textAlign',
      isShow: true,
      component: <TextAlign />,
    },
    {
      name: '间距',
      key: 'letterSpacing',
      isShow: true,
      component: (
        <SliderText
          min={0}
          defaultValue={letterSpacing}
          onChange={val => {
            updateLetterSpacing(val);
          }}
        />
      ),
    },
    {
      name: '行高',
      key: 'lineHeight',
      isShow: true,
      component: (
        <SliderText
          defaultValue={lineHeight}
          onChange={val => {
            updateLineHeight(val);
          }}
        />
      ),
    },
    {
      name: '不透明度',
      key: 'opacity',
      isShow: true,
      component: (
        <SliderText
          defaultValue={opacity}
          onChange={val => {
            updateOpacity(val);
          }}
        />
      ),
    },
    {
      // 普通文字颜色
      name: '颜色',
      key: 'color',
      isShow: !currentAsset?.attribute?.effectColorful,
      // component: <FontColor />,
      component: currentAsset && <TextColor asset={currentAsset} />,
    },
    {
      name: '渐变取色',
      key: 'gradient',
      isShow: false,
      component: (
        <GradientColor
          type="background"
          value="linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(248, 202, 107) 0%, rgb(252, 174, 125) 59.2593%, rgb(252, 174, 125) 60.4938%)"
          onChange={val => { }}
        />
      ),
    },
    {
      // 花字文字颜色
      name: '颜色',
      key: 'color',
      // isShow: false,
      isShow: currentAsset?.attribute?.effectColorful,
      component: <EffectMachine />,
    },
    {
      name: '',
      key: 'backgroundFont',
      isShow:
        currentAsset?.meta.type === 'text' &&
        !currentAsset?.attribute?.effectColorful,
    },
  ];
  return (
    <div className="xdd-designer-sider-panel-padding">
      {basicList.map(item => {
        if (item.key === 'backgroundFont' && item.isShow) {
          return <BackgroundFont BasicItem={BasicItem} key={item.key} />;
        }
        if (item.isShow) {
          return <BasicItem {...item} key={item.key} />;
        }
      })}
    </div>
  );
}
export default observer(TextBasic);
