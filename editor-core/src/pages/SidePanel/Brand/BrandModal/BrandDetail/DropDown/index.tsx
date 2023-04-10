import React, { useState } from 'react';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

function DropDown(props: {
  children: any;
  right?: any;
  isOpen: boolean;
  name: string;
}) {
  const { right, isOpen = false, name, children } = props;
  const [open, setOpen] = useState(isOpen);
  return (
    <div className={styles.dropDown}>
      <div className={styles.dropDownTop}>
        <div
          className={styles.dropDownTopLeft}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div className={styles.dropDownTopLeftIcon}>
            <XiuIcon
              type="right"
              style={
                open
                  ? { transform: 'rotate(90deg)' }
                  : { transform: 'rotate(0deg)' }
              }
            />
          </div>

          <span className={styles.dropDownTopLeftSpan}>{name}</span>
        </div>
        {right && <div className={styles.dropDownTopRight}>{right}</div>}
      </div>
      {open && <div className={styles.dropDownContent}>{children}</div>}
    </div>
  );
}

export default DropDown;
