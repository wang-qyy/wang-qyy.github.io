import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import { Spin, SpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function LoadingIcon(fontSize?: CSSProperties['fontSize']) {
  return <LoadingOutlined style={{ fontSize: fontSize ?? 75 }} spin />;
}

interface AssetLoadingProps extends SpinProps {
  fontSize?: CSSProperties['fontSize'];
}

function AssetLoading({
  children,
  fontSize,
  ...props
}: PropsWithChildren<AssetLoadingProps>) {
  const Icon = useMemo(() => {
    return LoadingIcon(fontSize);
  }, [fontSize]);
  return (
    <Spin indicator={Icon} {...props}>
      {children}
    </Spin>
  );
}

export default AssetLoading;
