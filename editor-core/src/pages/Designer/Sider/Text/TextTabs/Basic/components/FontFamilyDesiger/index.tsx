import { PropsWithChildren } from 'react';
import { useSetState } from 'ahooks';

import { Popover } from 'antd';
import { XiuIcon } from '@/components';
import classnames from 'classnames';
import { useFontFamilyByObserver, observer } from '@hc/editor-core';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import { cdnHost } from '@/config/urls';
import { getFontFamily } from '@/utils/fontHandler';

import { zh, en } from '@/pages/TopToolBar/FontFamily/textList';

import styles from './index.modules.less';

const FontFamilyList = observer(
  ({
    language = 'zh',
    onChange,
  }: {
    language: string;
    onChange: (fontFamily: string) => void;
  }) => {
    const [fontFamily, updateFontFamily] = useFontFamilyByObserver();

    return (
      <div className={styles['font-family-list']}>
        {(language === 'zh' ? zh : en).map(group => (
          <div key={`fontFamily-${group.cateName}`}>
            <div className={styles.cateName}>{group.cateName}</div>
            <div>
              {group.fontList.map((font, index) => {
                const fontFamilyItem = getFontFamily(font);
                const fontImgUrl = `${cdnHost}/index_img/fonts/white/${fontFamilyItem}.svg`;
                return (
                  <div
                    key={`fontFamily-${font}-${index}`}
                    className={classnames(styles['font-family-item'], {
                      [styles['font-family-active']]:
                        fontFamily === fontFamilyItem,
                    })}
                    onClick={() =>
                      onChange
                        ? onChange(fontFamilyItem)
                        : updateFontFamily(fontFamilyItem)
                    }
                  >
                    <img src={fontImgUrl} alt={font} height={22} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

interface FontFamilyProps {
  onChange: (fontFamily: string) => void;
}

interface SelectedFontFamilyProps {
  fontFamily?: string;
  onChange?: (fontFamily: string) => void;
}
const DesignerFontFamilyContent = ({ onChange }: FontFamilyProps) => {
  const [state, setState] = useSetState({
    activeLanguage: 'zh',
  });
  return (
    <>
      <div className={styles['language-tabs']}>
        <div
          className={classnames(styles['language-tabs-item'], {
            [styles['language-item-active']]: state.activeLanguage === 'zh',
          })}
          onClick={() => setState({ activeLanguage: 'zh' })}
        >
          中文
        </div>
        <div
          className={classnames(styles['language-tabs-item'], {
            [styles['language-item-active']]: state.activeLanguage === 'en',
          })}
          onClick={() => setState({ activeLanguage: 'en' })}
        >
          英文
        </div>
      </div>
      <LazyLoadComponent visible={state.activeLanguage === 'en'}>
        <FontFamilyList language="en" onChange={onChange} />
      </LazyLoadComponent>
      <LazyLoadComponent visible={state.activeLanguage === 'zh'}>
        <FontFamilyList language="zh" onChange={onChange} />
      </LazyLoadComponent>
    </>
  );
};
const DesignerFontFamily = ({
  fontFamily: propsFontFamily,
  onChange,
}: PropsWithChildren<SelectedFontFamilyProps>) => {
  const [fontFamily, updateFontFamily] = useFontFamilyByObserver();
  return (
    <div className={styles['designer-font-family']}>
      <Popover
        color="#17171F"
        placement="bottom"
        trigger="click"
        overlayClassName={styles['popover-styles']}
        content={
          <div style={{ padding: 18 }}>
            <DesignerFontFamilyContent
              onChange={onChange || updateFontFamily}
            />
          </div>
        }
      >
        <div className={styles['font-family-wrap-desiger']}>
          <div>
            {(propsFontFamily || fontFamily) && (
              <img
                src={`${cdnHost}/index_img/fonts/white/${
                  propsFontFamily || fontFamily
                }.svg`}
                alt="text"
                height={22}
              />
            )}
          </div>
          <XiuIcon type="iconbofang" className={styles['wrap-icon']} />
        </div>
      </Popover>
    </div>
  );
};
export default observer(DesignerFontFamily);
