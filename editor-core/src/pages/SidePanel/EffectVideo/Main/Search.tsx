import { PropsWithChildren } from 'react';

import { Tabs } from 'antd';

import More from './More';
import styles from './index.modules.less';

interface MoreProps {
  keyword?: string;
  ratio?: string;
  class_id: string;
}

export default function Search({
  class_id,
  keyword,
  ratio,
}: PropsWithChildren<MoreProps>) {
  return (
    <More
      hasTitle={false}
      class_id={class_id}
      keyword={keyword}
      ratio={ratio}
      action="videoEffect_search_add"
    />
  );
}
