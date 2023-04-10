import { message } from 'antd';
import { useRequest } from 'ahooks';
import { getAllTemplatesWhenSave } from '@/kernel';

import { submitDoc, downloadPolling } from '@/apis/global';
import { convertDataForSave } from '@/utils/simplify';
import { windowBeforeUnload } from '@/utils';
import { setPollingStatus, setLimitStatus } from '@/pages/store/download';
import getUrlParams from '@/utils/urlProps';
import { FileFormat } from '@/typings';

interface SubmitDocRes {
  code: 200 | 0;
}

type ResType =
  | 200 //
  | 3 // 没有下载次数了
  | 2 // 未登录
  | -1 //失败重试  code
  | 0; //等待中

interface PollingRes {
  code: ResType;
  data: {
    data: string;
    previewUrl?: string;
  };
}

export default function useDownload(opts: { onSuccess: () => void }) {
  function onError(msg?: string) {
    message.info(`Something wen't wrong,msg:${msg}`);
  }

  const { run, cancel } = useRequest(downloadPolling, {
    manual: true,
    pollingInterval: 1000,
    onSuccess: async (res: PollingRes) => {
      if (res.code === 200) {
        windowBeforeUnload.close();
        await window.open(res.data.data, '_self');
        cancel();
        setPollingStatus(false);
        message.success('success');
        windowBeforeUnload.open();
      } else if (res.code === 3) {
        setLimitStatus(true);
        setPollingStatus(false);
      } else if (res.code === 2) {
        message.info('请登录后再进行下载');
      } else if (res.code === -1) {
        onError('please try it again');
      }
    },
    onError(err) {
      onError();
    },
  });

  const { run: submit } = useRequest(submitDoc, {
    manual: true,
    onSuccess(res) {
      if (res.code === 200) {
        run(res.data.jobId);
      } else if (res.code === 3) {
        setLimitStatus(true);
        setPollingStatus(false);
      } else if (res.code === 2) {
        message.info('请登录后再进行下载');
      } else {
        onError();
      }
    },
    onError(err) {
      onError();
    },
  });

  function start(format: FileFormat = 'jpg') {
    setPollingStatus(true);
    const { pid, source_from } = getUrlParams();
    const data = convertDataForSave(getAllTemplatesWhenSave());
    submit({ pid, source_from, format: format, doc: data });
  }

  return { start };
}
