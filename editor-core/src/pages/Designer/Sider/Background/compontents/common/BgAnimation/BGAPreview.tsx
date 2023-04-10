import react, { useRef } from 'react';
import { ossEditorPath } from '@/config/urls';
import { BGA_ID_MAP } from '@hc/editor-core';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import './index.modules.less';

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
      className="bgAni-item"
      onClick={() => {
        onClick(bgaId);
      }}
    >
      <div
        className={classNames('item-part', {
          active: active === bgaId,
          'no-animation': title === '无动画',
        })}
      >
        {title === '无动画' ? (
          <XiuIcon type="iconIcon-jinyong" />
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
            alt=""
          />
        )}
      </div>
      <p className="title">{title}</p>
    </div>
  );
}
export default Item;
