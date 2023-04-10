import React, { forwardRef, MouseEvent, useImperativeHandle } from 'react';
import { observer } from 'mobx-react';
import { useBoxSelection } from '@kernel/Canvas/BoxSelection/hooks';

export interface BoxSelectionRef {
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
}
// eslint-disable-next-line react/display-name
const BoxSelection = forwardRef<BoxSelectionRef, {}>((props, ref) => {
  const { onMouseDown, style, wrapperRef } = useBoxSelection();

  // useImperativeHandle(ref, () => ({
  //   onMouseDown,
  // }));
  return (
    <div className="hc-boxSelection-wrapper" ref={wrapperRef}>
      <div className="hc-boxSelection" style={style} />
    </div>
  );
});
export default observer(BoxSelection);
