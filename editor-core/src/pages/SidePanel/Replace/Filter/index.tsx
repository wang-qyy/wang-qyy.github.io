import { Radio } from 'antd';
import classNames from 'classnames';

import './index.less';

interface FilterOption {
  value: string;
  label: string;
}

interface FileterItem {
  key: string;
  label: string;
  type: 'radio' | string;
  options: FilterOption[];
}

export default function Filters({
  fileters,
  onFilter,
  filtered = {},
}: {
  onFilter: (params: { [key: string]: string }) => void;
  fileters: FileterItem[];
  filtered: { [key: string]: string };
}) {
  return (
    <div className="xiudd-filters">
      {fileters.map(item => (
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
                  key={option.value}
                  onClick={() => {
                    onFilter({ [item.key]: option.value });
                  }}
                  className={classNames('xiudd-filters-option', {
                    'xiudd-filters-option-active':
                      filtered[item.key] === option.value,
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
