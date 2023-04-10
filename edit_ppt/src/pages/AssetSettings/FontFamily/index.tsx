import { Select } from 'antd';
import { observer } from 'mobx-react';

import { useFontFamily } from '@/kernel';
import { getFontList } from '@/pages/store/font';

import { DefaultSettingProps } from '../typing';

function FontFamily(props: DefaultSettingProps) {
  const { asset, style, ...others } = props;
  const [value, update] = useFontFamily();

  const list = getFontList();

  return (
    <Select
      {...others}
      value={value}
      onChange={update}
      style={{ ...style, fontFamily: value, fontSize: 18, marginRight: 16 }}
    >
      {list.map((font) => (
        <Select.Option
          key={font.id}
          value={font.font}
          style={{ fontFamily: font.font, fontSize: 18, lineHeight: '40px' }}
        >
          {font.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default observer(FontFamily);
