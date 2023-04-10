import { useEffect } from 'react';
import Layout from '@/pages/layout';
import { getAllTemplatesWhenSave } from '@/kernel';
import { convertDataForSave } from '@/utils/simplify';

import GlobalModal from './GlobalModal';

import '../global.less';

export default () => {
  return (
    <>
      <Layout />
      <GlobalModal />
    </>
  );
};

(window as any).EDITOR_DEBUG = {};

(window as any).EDITOR_DEBUG.getSaveData = () =>
  convertDataForSave(getAllTemplatesWhenSave());
