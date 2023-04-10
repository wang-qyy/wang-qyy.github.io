import { useRef, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useSetState, useDebounce, useRequest } from 'ahooks';
import { getMixBackground } from '@/api/background';

import { stopPropagation } from '@/utils/single';

import InitialPage from './compontents/InitialPage';

import DetailPage, { ItemType } from './compontents/DetailPage';
import SearchPage from './compontents/SearchPage';

import styles from './index.less';

interface State {
  keyword: string;
  showKey: string;
  title: string;
  type?: ItemType;
}
const Background = () => {
  const inputRef = useRef(null);
  const [state, setState] = useSetState<State>({
    keyword: '',
    showKey: 'InitialPage',
    title: '',
  });

  // 获取起始页面展示数据
  const { data = { video: {}, image: {} }, run } = useRequest(
    getMixBackground,
    {
      manual: true,
      onError: err => {
        console.log('出错啦！！列表加载失败', err);
      },
    },
  );

  const {
    video: { items: videoArr = [] },
    image: { items: imageArr = [] },
  } = data;

  useEffect(() => {
    run();
  }, []);

  // 跳转更多页面，存储对应title
  const bindClickMore = (title: string, type: MoreType) => {
    setState({
      title,
      showKey: 'DetailPage',
      type,
    });
  };

  const debouncedValue = useDebounce(state.keyword, { wait: 500 });

  // 返回初始页面 清空输入框的值
  const bindClickback = () => {
    setState({
      showKey: 'InitialPage',
      keyword: '',
    });
  };
  // 显示对应的页面
  const DisplayedPage = () => {
    switch (state.showKey) {
      case 'SearchPage':
        return <SearchPage value={debouncedValue} />;
      case 'DetailPage':
        return (
          <DetailPage
            type={state.type}
            title={state.title}
            bindClickback={bindClickback}
            value={debouncedValue}
          />
        );
      default:
        return (
          <InitialPage
            bindClickMore={bindClickMore}
            videoArr={videoArr}
            imageArr={imageArr}
          />
        );
    }
  };

  // 如果在初始页面，跳到搜索页，其他页面存储对应页面的值，如果为空值返回初始页面
  const onPressEnter = (value: any) => {
    if (value.target.value === state.keyword) return;
    if (value.target.value) {
      switch (state.showKey) {
        case 'InitialPage':
          setState({
            showKey: 'SearchPage',
            keyword: value.target.value,
          });
          break;
        default:
          setState({
            keyword: value.target.value,
          });
      }
    } else {
      setState({
        keyword: '',
      });
    }
  };

  return (
    <div className={styles.backgroundWarp}>
      <div className={styles.topInput}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined />}
          size="large"
          value={state.keyword}
          placeholder="搜索您需要的背景视频"
          onPressEnter={onPressEnter}
          onChange={onPressEnter}
          onKeyDown={stopPropagation}
          onPaste={stopPropagation}
          suffix={
            state.showKey === 'SearchPage' ? (
              <div className={styles.suffix} onClick={bindClickback}>
                <CloseOutlined />
              </div>
            ) : null
          }
        />
      </div>
      <div className={styles.content}>{DisplayedPage()}</div>
    </div>
  );
};

export default Background;
