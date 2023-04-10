import { CSSProperties, memo, PropsWithChildren } from 'react';
import { useSetState } from 'ahooks';
import { DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useFontFamilyByObserver, observer } from '@hc/editor-core';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import OverwritePopover from '@/components/OverwritePopover';

import { cdnHost } from '@/config/urls';
import { getFontFamily } from '@/utils/fontHandler';

import { clickActionWeblog } from '@/utils/webLog';

import { zh, en } from './textList';

import './index.less';

const FontFamilyList = observer(
  ({
    fontFamilyListStyle,
    language = 'zh',
    onChange,
    selected,
  }: {
    fontFamilyListStyle?: object;
    language: string;
    onChange: (fontFamily: string) => void;
    selected?: string;
  }) => {
    const [fontFamily, updateFontFamily] = useFontFamilyByObserver();

    return (
      <OverlayScrollbarsComponent
        options={{
          className: 'os-theme-dark',
          scrollbars: { autoHide: 'never' },
          overflowBehavior: { y: 'scroll' },
        }}
      >
        <div className="font-family-list" style={fontFamilyListStyle}>
          {(language === 'zh' ? zh : en).map(group => (
            <div key={`fontFamily-${group.cateName}`}>
              <div>{group.cateName}</div>
              <div>
                {group.fontList.map((font, index) => {
                  const fontFamilyItem = getFontFamily(font);
                  const fontImgUrl = `${cdnHost}/index_img/fonts/${fontFamilyItem}.svg`;
                  return (
                    <div
                      key={`fontFamily-${font}-${index}`}
                      className={classnames({
                        'font-family-item': true,
                        'font-family-active':
                          (selected ?? fontFamily) === fontFamilyItem,
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
      </OverlayScrollbarsComponent>
    );
  },
);

interface FontFamilyProps {
  onChange: (fontFamily: string) => void;
  fontFamilyListStyle?: CSSProperties;
  selected?: string;
}

export const FontFamily = ({
  onChange,
  fontFamilyListStyle,
  selected,
}: PropsWithChildren<FontFamilyProps>) => {
  const [state, setState] = useSetState({
    activeLanguage: 'zh',
  });
  return (
    <>
      <div className="language-tabs">
        <div
          className={classnames({
            'language-tabs-item': true,
            'language-item-active': state.activeLanguage === 'zh',
          })}
          onClick={() => setState({ activeLanguage: 'zh' })}
        >
          中文
        </div>
        <div
          className={classnames({
            'language-tabs-item': true,
            'language-item-active': state.activeLanguage === 'en',
          })}
          onClick={() => setState({ activeLanguage: 'en' })}
        >
          英文
        </div>
      </div>
      <LazyLoadComponent visible={state.activeLanguage === 'en'}>
        <FontFamilyList
          language="en"
          onChange={onChange}
          fontFamilyListStyle={fontFamilyListStyle}
          selected={selected}
        />
      </LazyLoadComponent>
      <LazyLoadComponent visible={state.activeLanguage === 'zh'}>
        <FontFamilyList
          language="zh"
          onChange={onChange}
          fontFamilyListStyle={fontFamilyListStyle}
          selected={selected}
        />
      </LazyLoadComponent>
    </>
  );
};

interface SelectedFontFamilyProps {
  fontFamily?: string;
  onChange?: (fontFamily: string) => void;
  fontFamilyListStyle?: object;
  className?: string;
  style?: CSSProperties;
}

export const SelectedFontFamily = observer(
  (props: PropsWithChildren<SelectedFontFamilyProps>) => {
    const {
      fontFamily: propsFontFamily,
      fontFamilyListStyle,
      onChange,
      ...others
    } = props;

    const [fontFamily, updateFontFamily] = useFontFamilyByObserver();

    function handleChange(font: string) {
      updateFontFamily(font);

      // 用户编辑器功能埋点
      clickActionWeblog('tool_fontFamily', { action_label: font });
    }

    return (
      <OverwritePopover
        placement="bottomLeft"
        trigger="click"
        overlayInnerStyle={{ marginTop: -5 }}
        content={
          <div style={{ paddingLeft: 16, paddingTop: 8 }}>
            <FontFamily
              fontFamilyListStyle={fontFamilyListStyle}
              onChange={onChange || handleChange}
              selected={propsFontFamily}
            />
          </div>
        }
      >
        <div
          className={classnames('font-family-wrap')}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="selected-fontFamily">
            {(propsFontFamily || fontFamily) && (
              <img
                src={`${cdnHost}/index_img/fonts/${propsFontFamily || fontFamily
                  }.svg`}
                alt="text"
                height={22}
              />
            )}
          </div>
          <DownOutlined />
        </div>
      </OverwritePopover>
    );
  },
);

export default memo(FontFamily);
