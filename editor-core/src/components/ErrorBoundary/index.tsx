import React, { Component } from 'react';
import { Result, Button } from 'antd';
import { windowsLoading } from '@/utils/single';

import { pageErrorWebLog } from '@/utils/webLog';

function refresh() {
  window.location.reload();
}

export function ErrorBoundaryPage() {
  windowsLoading.closeWindowsLoading();
  return (
    <Result
      status="error"
      title="页面崩溃了~~~~~"
      subTitle="请点击刷新按钮，重新回到秀多多."
      extra={[
        <Button onClick={refresh} type="primary" key="console">
          刷新
        </Button>,
      ]}
    />
  );
}

interface isState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<any, isState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo);
    pageErrorWebLog();
  }

  refresh = () => {
    window.location.reload();
  };

  closeLoading = () => {
    // document.getElementById('editorLoadingNew').style.display = 'none';
    // document.getElementById('assetRotate').style.display = 'none';
    // document.getElementById('relinePlace').style.display = 'none';
    windowsLoading.closeWindowsLoading();
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <ErrorBoundaryPage />;
    }

    return children;
  }
}
