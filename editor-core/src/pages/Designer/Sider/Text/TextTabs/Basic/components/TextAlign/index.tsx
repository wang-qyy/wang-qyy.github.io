import { useTextAlignByObserver, observer } from '@hc/editor-core';
import StyleItem from '../StyleItem';
import styles from './index.modules.less';

const styleList = [
  {
    key: 'left',
    icon: 'icona-bianzu2',
    name: '左对齐',
  },
  {
    key: 'center',
    icon: 'icona-bianzu3',
    name: '居中',
  },
  {
    key: 'right',
    icon: 'icona-bianzu4',
    name: '右对齐',
  },
];
const TextAlign = () => {
  const [textAlign, updateTextAlign] = useTextAlignByObserver();
  return (
    <div className={styles.list}>
      {styleList.map(item => {
        return (
          <StyleItem
            {...item}
            isActive={item.key === textAlign}
            key={item.key}
            onCall={() => {
              updateTextAlign(item.key);
            }}
          />
        );
      })}
    </div>
  );
};
export default observer(TextAlign);
