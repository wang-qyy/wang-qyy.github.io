import { useEffect } from 'react';
import Layout from '@/pages/Layout';
import SimpleHeader from '@/pages/Header/WatermarkHeader';

import { windowsLoading } from '@/utils/single';
import Content from './Content';

const Watermark = () => {
  useEffect(() => {
    windowsLoading.closeWindowsLoading();
  }, []);

  return <Layout header={<SimpleHeader />} content={<Content />} />;
};

export default Watermark;
