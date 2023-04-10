import classNames from 'classnames';
import { Button, Select } from 'antd';
import { observer } from 'mobx-react';
import { useFontStyle, useFontWeight, useTextDecoration } from '@kernel/index';
import Icon from '@/components/Icon';

import { DefaultSettingProps } from '../typing';
import './index.less';

//
function FontStyle(props: DefaultSettingProps) {
  const [fontStyle, updateFontStyle] = useFontStyle();
  const [fontWeight, updateFontWeight] = useFontWeight();
  const [textDecoration, updateTextDecoration] = useTextDecoration();

  const FontStyleEnum = [
    {
      key: 'fontWeight',
      icon: 'iconfontWeight',
      active: fontWeight === 'bold',
      onClick() {
        updateFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
      },
    },
    {
      key: 'fontStyle',
      icon: 'iconjurassic_font-tilt',
      active: fontStyle === 'italic',
      onClick() {
        updateFontStyle(fontStyle === 'italic' ? 'normal' : 'italic');
      },
    },
    {
      key: 'underline',
      icon: 'iconxiahuaxian',
      active: textDecoration === 'underline',
      onClick() {
        updateTextDecoration(
          textDecoration === 'underline' ? 'none' : 'underline',
        );
      },
    },
    {
      key: 'deleteline',
      icon: 'iconshanchuxian',
      active: textDecoration === 'line-through',
      onClick() {
        updateTextDecoration(
          textDecoration === 'line-through' ? 'none' : 'line-through',
        );
      },
    },
  ];
  return (
    <div className="flex-box font-style mb-24 flex-col">
      <label className="label">Styles:</label>
      <div className="flex-box">
        {FontStyleEnum.map((item) => (
          <Button
            key={item.key}
            type="text"
            className={classNames('font-style-item', {
              'font-style-item-active': item.active,
            })}
            onClick={item.onClick}
          >
            <Icon type={item.icon} />
          </Button>
        ))}
      </div>
    </div>
  );
}

export default observer(FontStyle);
