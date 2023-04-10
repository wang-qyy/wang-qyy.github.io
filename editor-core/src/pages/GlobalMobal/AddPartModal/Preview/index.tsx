import React from 'react';
import { TemplateItem } from '@/api/template';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import styles from './index.modules.less';

interface IProps {
  previewItem: TemplateItem;
  onBack: () => void;
  shape: string;
  isSingle: boolean;
}

const Preview: React.FC<IProps> = props => {
  const { previewItem: item, onBack, shape, isSingle } = props;

  const width = shape === 'w' ? '80%' : 'auto';
  const height = shape === 'w' ? 'auto' : '80%';

  const previewUrl = isSingle ? item.preview_url : `${item.host}${item.imgUrl}`;

  const smallUrl = isSingle ? item.small_url : `${item.host}${item.small_url}`;
  return (
    <div
      className={classNames(styles.Preview, {
        [styles.show]: !!item,
      })}
    >
      <div className={styles.mask} />
      <div className={styles.video} style={{ width, height }}>
        <div className={styles.videoWrapper}>
          <div className={styles.close} onClick={onBack}>
            <XiuIcon
              type="iconchahao"
              style={{ fontSize: 20, color: '#fff' }}
            />
          </div>
          <img
            src={previewUrl}
            style={{ opacity: 0 }}
            width="100%"
            height="100%"
            alt="preview"
          />
          <AutoDestroyVideo
            poster=""
            clip={
              isSingle
                ? [item.position, item.position + item.duration]
                : undefined
            }
            playing
            src={smallUrl}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
