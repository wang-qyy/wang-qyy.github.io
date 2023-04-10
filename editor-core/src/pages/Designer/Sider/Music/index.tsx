import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  HTMLAttributes,
} from 'react';
import { useDebounceFn, useRequest } from 'ahooks';
import { Input, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { stopPropagation } from '@/utils/single';
import {
  getMaterialAudioList,
  getMusicEffect,
  getMusicEffectClassify,
} from '@/api/music';
import classNames from 'classnames';
import MusicTags from './compontents/MusicTags';
import MusicContent from './compontents/MusicContent';
import MusicPlay from './compontents/MusicPlay';
import MusicItem from './compontents/MusicItem';
import styles from './index.modules.less';

function MusicSearch(props: { onChange: (value: string) => void }) {
  function onChange(e: any) {
    props.onChange(e.target.value);
  }
  return (
    <div className={styles.topInput}>
      <Input
        prefix={<SearchOutlined />}
        size="large"
        placeholder="请输入搜索词"
        onPressEnter={onChange}
        onChange={onChange}
        onPaste={stopPropagation}
        onKeyDown={stopPropagation}
        // allowClear
      />
    </div>
  );
}

const Music = ({ onPlay, playInfo, isPlaying, _isPlaying }: any) => {
  const [keyword, _keyword] = useState<string>('');
  const [class_id, _class_id] = useState<string>('');

  const { run: setKeyword } = useDebounceFn(_keyword, { wait: 500 });

  // 点击标签记录标签id
  const bindClickTag = useCallback((id: string) => {
    _class_id(id);
  }, []);

  // 参数  //包一层值不变子组件不更新
  const param = useMemo(
    () => ({
      keyword,
      page: 1,
      pageSize: 40,
      class_id,
    }),
    [class_id, keyword],
  );
  return (
    <>
      <MusicSearch onChange={setKeyword} />
      <MusicTags bindClickTag={bindClickTag} class_id={class_id} />
      <MusicContent
        param={param}
        request={getMaterialAudioList}
        Item={({ item }) => (
          <MusicItem
            data={item}
            key={item.id}
            bindPlay={_isPlaying}
            isPlay={isPlaying}
            isCheck={playInfo?.id === item.id}
            onClick={() => onPlay(item)}
          />
        )}
      />
    </>
  );
};

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  data: { id: string; name: string };
}

function Tag({ data, className, ...others }: TagProps) {
  return (
    <span
      className={classNames(styles['music-tag-item'], className)}
      {...others}
    >
      {data.name}
    </span>
  );
}

// 音效列表
function MusicEffect({ onPlay, playInfo, isPlaying, _isPlaying }: any) {
  const [keyword, _keyword] = useState<string>();
  const [filter_id, _filter_id] = useState<string>('');
  const [parentId, _parentId] = useState('');
  const { run: setKeyword } = useDebounceFn(_keyword, { wait: 500 });

  const [styleTags, _styleTags] = useState<{ [key: string]: string }[]>([]);

  const { run, data = [] } = useRequest(getMusicEffectClassify, {
    manual: true,
  });

  useEffect(() => {
    // 获取音效分类
    run({ filter_id: '1230860' });
  }, []);

  return (
    <>
      <MusicSearch onChange={setKeyword} />

      <div className={styles['music-tags']} style={{ marginTop: 18 }}>
        <span className={styles['music-tag-label']}>类型：</span>
        <Tag
          data={{ name: '全部', id: '' }}
          className={classNames({ [styles.active]: !parentId })}
          onClick={() => {
            _filter_id('');
            _parentId('');
            _styleTags([]);
          }}
        />
        {data.map(item => (
          <Tag
            key={item.id}
            data={item}
            className={classNames({ [styles.active]: item.id === parentId })}
            onClick={() => {
              _filter_id(item.id);
              _parentId(item.id);
              _styleTags([{ id: item.id, name: '全部' }, ...item.children]);
            }}
          >
            {item.name}
          </Tag>
        ))}
      </div>

      {styleTags.length > 0 && (
        <div className={styles['music-tags']}>
          <span className={styles['music-tag-label']}>风格：</span>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              flex: 1,
            }}
          >
            {[...styleTags].map(item => (
              <Tag
                className={classNames({
                  [styles.active]: item.id === filter_id,
                })}
                key={item.id}
                data={item}
                onClick={() => {
                  _filter_id(item.id);
                }}
              >
                {item.name}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <MusicContent
        request={getMusicEffect}
        param={{
          keyword,
          filter_id: filter_id || '1230862,1230863,1230861',
        }}
        Item={({ item }: any) => {
          const data = {
            id: item.gid,
            preview: item.url,
            file_type: 'mp3',
            total_time: item.duration,
            ...item,
          };
          return (
            <MusicItem
              data={data}
              key={item.id}
              bindPlay={_isPlaying}
              isPlay={isPlaying}
              isCheck={playInfo?.id === item.gid}
              onClick={() => onPlay(data)}
            />
          );
        }}
      />
    </>
  );
}

export default function MusicPanel() {
  // 当前播放的音频
  const [playInfo, _playInfo] = useState<{ id: string }>();

  // 音频播放状态
  const [isPlaying, _isPlaying] = useState(false);

  // 初始化播放
  function onPlay(data: any) {
    _playInfo(data);
    _isPlaying(true);
  }

  // 退出播放
  function onCancelPlay() {
    _playInfo(undefined);
    _isPlaying(false);
  }

  return (
    <div className={styles.musicPanel}>
      <Tabs>
        <Tabs.TabPane tab="音乐" key="music">
          <Music
            onPlay={onPlay}
            _isPlaying={_isPlaying}
            isPlay={isPlaying}
            playInfo={playInfo}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="音效" key="effect">
          <MusicEffect
            onPlay={onPlay}
            _isPlaying={_isPlaying}
            isPlay={isPlaying}
            playInfo={playInfo}
          />
        </Tabs.TabPane>
      </Tabs>
      {playInfo && (
        <MusicPlay
          data={playInfo}
          bindPlay={_isPlaying}
          onCancel={onCancelPlay}
          isPlay={isPlaying}
        />
      )}
    </div>
  );
}
