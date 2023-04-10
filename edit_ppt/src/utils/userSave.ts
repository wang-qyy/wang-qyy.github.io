import { stringify } from 'qs';
import { getAllTemplatesWhenSave } from '@/kernel';
import { convertDataForSave } from '@/utils/simplify';
import getUrlParams from '@/utils/urlProps';
import { submitDoc, downloadPolling } from '@/apis/global';
import { config } from '@/config/constants';
import { Online } from '@/utils/typing';
import { setTemplateInfo } from '@/pages/store/template';
import { message } from 'antd';

function testData() {
  return new Promise((rej) => {
    setTimeout(() => {
      rej({ code: 200, data: { draft_id: 1 } });
    });
  });
}
interface SaveParams {
  info?: {
    online?: Online;
  };
  autoSave?: boolean;
  onSuccess?: (response: any) => void;
}

function getSaveData() {
  return convertDataForSave(getAllTemplatesWhenSave());
}

async function save(opt?: SaveParams) {
  const { info } = opt || { info: {} };
  const urlParams = getUrlParams();

  const saveData = getSaveData();
  const res = await submitDoc({
    draft_id: urlParams.draft_id,
    source_from: urlParams.source_from,
    format: config.is_designer ? 'png' : 'jpg',
    doc: saveData,
    is_designer: config.is_designer,
    ...info,
  });

  if (res.code !== 200) {
    return;
  }
  Object.assign(urlParams, {
    draft_id: res.data.draft_id,
  });

  if (info?.online !== undefined) {
    setTemplateInfo({ online: info?.online });
  }
  message.info('操作成功');
  window.history.replaceState('', document.title, `?${stringify(urlParams)}`);
}

function debounceFn(fn: (params?: SaveParams) => void) {
  const wait = 2000;

  let timer: any;

  let flag: any;

  return (params?: SaveParams) => {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = setTimeout(() => {
        // 延迟函数执行完毕，清空缓存的定时器序号
        timer = undefined;
      }, wait);

      fn(params);
    } else {
      // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
      clearTimeout(timer);
      clearTimeout(flag);
      timer = setTimeout(() => {
        // 延迟函数执行完毕，清空缓存的定时器序号
        fn(params);

        //  保存接口1秒内仅能调用一次
        clearTimeout(flag);
        flag = setTimeout(() => {
          timer = undefined;
        }, wait);
      }, wait);
    }
  };
}

export const onSave = debounceFn(save);
