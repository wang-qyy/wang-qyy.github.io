import {
  useFontWeightByObserver,
  useFontStyleByObserver,
  useWritingModeByObserver,
  useTextDecorationByObserver,
  useGetCurrentAsset,
  observer,
} from '@hc/editor-core';
import StyleItem from '../StyleItem';
import styles from './index.modules.less';

const FontStyle = () => {
  const [writingMode, updateWritingMode] = useWritingModeByObserver(); // 文字方向
  const [fontWeight, updateFontWeight] = useFontWeightByObserver();
  const [fontStyle, updateFontStyle] = useFontStyleByObserver(); // 斜体
  const [textDecoration, updateTextDecoration] = useTextDecorationByObserver();
  const currentAsset = useGetCurrentAsset();
  const styleList = [
    {
      key: 'fontWeight',
      icon: 'iconjiacu',
      name: '字体加粗',
      isShow: true,
      isActive: fontWeight === 'bold',
      onCall: () => {
        updateFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
      },
    },
    {
      key: 'fontStyle',
      icon: 'iconxieti',
      name: '字体倾斜',
      isShow: true,
      isActive: fontStyle === 'italic',
      onCall: () =>
        updateFontStyle(fontStyle === 'italic' ? 'normal' : 'italic'),
    },
    {
      key: 'underline',
      icon: 'iconziyuan1',
      name: '下划线',
      isShow: true,
      isActive: textDecoration === 'underline',
      onCall: () => {
        updateTextDecoration(
          textDecoration === 'underline' ? 'none' : 'underline',
        );
      },
    },
    {
      key: 'writingMode',
      icon: 'iconzijianju1',
      name: '横竖排版',
      isShow: true,
      // isShow: !currentAsset?.attribute?.effectColorful,
      isActive: writingMode === 'vertical-rl',
      onCall: () =>
        updateWritingMode(
          writingMode === 'horizontal-tb' ? 'vertical-rl' : 'horizontal-tb',
        ),
    },
    {
      key: 'linethrough',
      icon: 'iconshanchuzi',
      name: '删除线',
      isShow: true,
      isActive: textDecoration === 'line-through',
      onCall: () => {
        updateTextDecoration(
          textDecoration === 'line-through' ? 'none' : 'line-through',
        );
      },
    },
  ];
  return (
    <div className={styles.list}>
      {styleList.map(item => {
        if (item.isShow) {
          return (
            <StyleItem {...item} isActive={item.isActive} key={item.key} />
          );
        }
      })}
    </div>
  );
};
export default observer(FontStyle);
