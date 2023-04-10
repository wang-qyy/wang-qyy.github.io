import { useEffect } from 'react';
import Layout from '@/pages/layout';
import { getAllTemplatesWhenSave } from '@/kernel';
import { convertDataForSave } from '@/utils/simplify';

import GlobalModal from './GlobalModal';
import PPTHome from './ppt';
import getUrlParams from '../utils/urlProps';

import '../global.less';

export default () => {
  return (
    <>
      <PPTHome />
      <GlobalModal />
    </>
  );
};

(window as any).EDITOR_DEBUG = {};

(window as any).EDITOR_DEBUG.getSaveData = () =>
  convertDataForSave(getAllTemplatesWhenSave());
