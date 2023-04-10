import { Radio } from 'antd';
import classNames from 'classnames';
import { set } from 'lodash-es';

import './index.less';

interface FilterOption {
  key?: string;
  value: string;
  label: string;
  checked?: boolean;
}

export interface FileterItem {
  key: string;
  label: string;
  type: 'radio' | 'button';
  options: FilterOption[];
}

export default function Filters({
  filters,
  onFilter,
  filtered = {},
}: {
  onFilter: (params: { [key: string]: string }) => void;
  filters: FileterItem[];
  filtered: { [key: string]: string };
}) {
  return (
    <div className="xiudd-filters">
      {filters.map(item => (
        <div key={item.key}>
          <div>{item.label}</div>
          <div className="xiudd-filters-group">
            {item.type === 'radio' ? (
              <Radio.Group
                options={item.options}
                onChange={e => {
                  const { value } = e.target;
                  onFilter({ [item.key]: value });
                }}
                value={filtered[item.key]}
              />
            ) : (
              item.options.map(option => (
                <span
                  key={option.key ?? option.value}
                  onClick={() => {
                    const [key, value] = item.key && item.key.split('.');
                    onFilter(
                      option.key
                        ? option.value
                        : { [key]: { [value]: '' }, [item.key]: option.value },
                    );
                  }}
                  className={classNames('xiudd-filters-option', {
                    'xiudd-filters-option-active':
                      option.checked ?? filtered[item.key] === option.value,
                  })}
                >
                  {option.label}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
