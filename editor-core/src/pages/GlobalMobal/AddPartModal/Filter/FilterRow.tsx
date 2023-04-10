import { FilterItem } from '@/api/template';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { categoriesType } from '../options';

import styles from './index.modules.less';

interface IProps {
  label: string;
  list: FilterItem[];
  onSelect: (params: object) => void;
}

const itemHeight = 30;

const FilterRow: React.FC<IProps> = props => {
  const { label, list, onSelect } = props;
  const [showAll, _showAll] = useState(false);
  const [hasMore, _hasMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (listRef.current && listRef.current.scrollHeight > itemHeight) {
      _hasMore(true);
    }
  }, []);

  const switchShowAll = () => {
    _showAll(!showAll);
  };

  return (
    <div className={styles.filterRow}>
      <div className={styles.selector}>
        <div className={styles.label}>{categoriesType[label]}</div>
        <div
          className={classNames(styles.list, {
            [styles.showAll]: showAll,
          })}
          ref={listRef}
        >
          {list.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onSelect(item.params);
              }}
              className={classNames(styles.item, {
                [styles.active]: item.active,
              })}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      {hasMore && (
        <div onClick={switchShowAll} className={styles.more}>
          更多
          <XiuIcon
            type="iconarrow_right"
            style={{ marginLeft: 6 }}
            className={classNames({ [styles.collapsed]: showAll })}
          />
        </div>
      )}
    </div>
  );
};

export default FilterRow;
