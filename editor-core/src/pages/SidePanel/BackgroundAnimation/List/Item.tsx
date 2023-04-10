import react, { useRef } from 'react';
import { ossEditorPath } from '@/config/urls';
import { BGA_ID_MAP } from '@hc/editor-core';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import styles from './index.less';

export interface ItemProps {
  bgaId: number;
  active: number;
  onClick: (bgaId: number) => void;
}
function Item({ bgaId, onClick, active }: ItemProps) {
  const ref = useRef<HTMLImageElement>(null);

  // @ts-ignore
  const title = BGA_ID_MAP[bgaId]?.name || '无动画';

  return (
    <div
      className={styles.item}
      onClick={() => {
        onClick(bgaId);
      }}
    >
      {title === '无动画' ? (
        <div
          className={classNames(styles.noAnimation, {
            [styles.active]: active === bgaId,
          })}
        >
          <XiuIcon type="iconIcon-jinyong" />
        </div>
      ) : (
        <img
          onMouseEnter={() => {
            if (ref.current) {
              ref.current.src = ossEditorPath(
                `/image/backgroundAnimation/${bgaId}.gif`,
              );
            }
          }}
          onMouseLeave={() => {
            if (ref.current) {
              ref.current.src = ossEditorPath(
                `/image/backgroundAnimation/jingtu.png`,
              );
            }
          }}
          ref={ref}
          src={ossEditorPath(`/image/backgroundAnimation/jingtu.png`)}
          className={classNames(styles.animationImg, {
            [styles.active]: active === bgaId,
          })}
          alt=""
        />
      )}
      <p className={styles.title}>{title}</p>
    </div>
  );
}
export default Item;
