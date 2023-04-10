import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useRequest } from 'ahooks';

import { getShareLink } from '@/api/pub';

import styles from './index.modules.less';

export default function Content() {
  const [copied, setCopied] = useState(false);

  const { data } = useRequest(getShareLink);

  const handleCopy = event => {
    navigator.clipboard.writeText(data.link);

    setCopied(true);
    window?.xa?.track('CopyInviteUrl', {
      extra: 'editPage',
    });
  };

  useEffect(() => {
    window?.xa?.track('pageview', {
      extra: 'editPage',
    });
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>限时惊喜</div>
      <div className={styles.desc}>
        仅需邀请1位好友，即可解锁该模板的合成下载权限
      </div>
      <Button type="primary" onClick={handleCopy}>
        {copied ? '复制成功' : '点击复制邀请链接'}
      </Button>
    </div>
  );
}
