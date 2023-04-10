import React from 'react';
import './index.less';
import DownloadWarning from './DownloadWarning';
import VipWarning from '../VipWarning';

export default function BeforeDownLoad() {
  return (
    <>
      <DownloadWarning />
      <VipWarning />
    </>
  );
}
