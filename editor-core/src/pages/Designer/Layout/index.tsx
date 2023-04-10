import { ReactChild, useState, MouseEvent } from 'react';
import { Layout } from 'antd';
import { stopPropagation, mouseMoveDistance } from '@/utils/single';

import { useAsideWidth } from '@/store/adapter/useDesigner';

import './index.less';

const { Content, Header, Footer, Sider } = Layout;

interface DesignerLayoutProps {
  header: ReactChild;
  footer: ReactChild;
  sider: ReactChild;
  content: ReactChild;
}

function DesignerLayout({
  header,
  footer,
  sider,
  content,
}: DesignerLayoutProps) {
  const { width, update: setWidth } = useAsideWidth();

  function resetWidth(e: MouseEvent<HTMLDivElement>) {
    stopPropagation(e);
    e.preventDefault();

    mouseMoveDistance(e, distanceX => {
      let newWidth = width + distanceX;

      newWidth = Math.max(newWidth, 560);
      newWidth = Math.min(newWidth, 900);

      setWidth(newWidth);
    });
  }

  return (
    <Layout className="designer-wrap designer-layout">
      <Header>{header}</Header>
      <Layout>
        <Sider width={width}>
          {sider}
          <div className="asset-resize" onMouseDown={resetWidth} />
        </Sider>
        <Content>{content}</Content>
      </Layout>
      <Footer>{footer}</Footer>
    </Layout>
  );
}
export default DesignerLayout;
