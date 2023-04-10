import { Input } from 'antd';
import {
  observer,
  addTextLogo,
  useUpdateLogoTextByObserver,
} from '@hc/editor-core';
import { debounce } from 'lodash-es';
import { stopPropagation } from '@/utils/single';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { clickActionWeblog } from '@/utils/webLog';

function TextInput() {
  const [logoText, update] = useUpdateLogoTextByObserver();

  const handleChange = debounce(text => {
    text = text.split('\n');
    clickActionWeblog('action_logo_inputText');

    if (logoText) {
      update(text);
    } else {
      addTextLogo({ text, ...getCanvasInfo(), fontFamily: 'fnsyhtHeavy' });
    }
  }, 500);

  return (
    <Input.TextArea
      defaultValue={logoText?.join('\n')}
      placeholder="请输入LOGO内容"
      autoSize={{ minRows: 3 }}
      onChange={e => {
        const { value } = e.target;
        handleChange(value);
      }}
      onKeyDown={stopPropagation}
      maxLength={20}
    />
  );
}

export default observer(TextInput);
