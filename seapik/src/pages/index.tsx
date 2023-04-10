import { useEffect } from 'react';
import Layout from '@/pages/layout';
import { getAllTemplatesWhenSave } from '@/kernel';
import { convertDataForSave } from '@/utils/simplify';

import GlobalModal from './GlobalModal';
import PPTHome from './ppt';

import '../global.less';

export default function Home() {
  return (
    <>
      <PPTHome />
      <GlobalModal />
    </>
  );
}

(window as any).EDITOR_DEBUG = {};

(window as any).EDITOR_DEBUG.getSaveData = () =>
  convertDataForSave(getAllTemplatesWhenSave());
