import {
  PropsWithChildren,
  useState,
  useRef,
  memo,
  forwardRef,
  LegacyRef,
} from 'react';
import classNames from 'classnames';
import { debounce, isEqual } from 'lodash-es';
import { Popover, Input } from 'antd';
import useDeepCompareEffect from '@/components/InfiniteLoader/useDeepCompareEffect';

import { CloseCircleOutlined } from '@ant-design/icons';

import XiuIcon from '@/components/XiuIcon';

import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import { getSidePanelInfo } from '@/store/adapter/useGlobalStatus';

import Filter, { FileterItem } from './Filter';

import './index.less';

interface SearchProps {
  value?: any;
  searchKey: string;
  defaultValue?: any;
  onChange: (value?: any) => void;
  onFilter?: (value?: any) => void;
  placeholder?: string;
  destroyFilterOnHide?: boolean;
  filters?: FileterItem;
  className?: string;
  onClickFilter?: () => void;
}

const Search = (props: PropsWithChildren<SearchProps>, ref: LegacyRef<any>) => {
  const {
    children,
    filters,
    value,
    onChange,
    placeholder,
    destroyFilterOnHide,
    defaultValue,
    searchKey,
    onFilter,
    className,
    onClickFilter = () => { },
    ...res
  } = props;

  const inputRef = useRef(null);

  const [search, setSearch] = useState<any>(defaultValue);
  const [filterVisible, setFilterVisible] = useState(false);

  useDeepCompareEffect(() => {
    if (!isEqual(search, defaultValue)) {
      setSearch(defaultValue);
    }
  }, [defaultValue]);

  const inputChange = debounce(e => {
    const { value } = e.target;
    const { menu } = getSidePanelInfo();

    setSearch((prev: any) => ({ ...prev, [searchKey]: value }));
    onChange({ ...search, [searchKey]: value });
    clickActionWeblog(`action_${menu}_search`, {
      action_label: value,
    });
  }, 300);

  // 筛选
  function handleFilter(filter: any) {
    const { menu } = getSidePanelInfo();

    setSearch((prev: any) => ({ ...prev, ...filter }));
    onFilter && onFilter({ ...search, ...filter });
    setFilterVisible(false);
    clickActionWeblog(`action_${menu}_filter`, {
      action_label: JSON.stringify(filter),
    });
  }

  // 清除全部 筛选搜索
  function onClear() {
    onChange({ [searchKey]: '' });
    onFilter && onFilter(defaultValue);
    setSearch(defaultValue ?? {});

    if (ref?.current) {
      ref.current.state.value = '';
    } else if (inputRef?.current) {
      inputRef.current.state.value = '';
    }
  }

  return (
    <div className={classNames('xiudd-search', className)}>
      <Input
        ref={ref ?? inputRef}
        allowClear={!filters}
        size="middle"
        prefix={<XiuIcon type="iconsousuo" />}
        placeholder={placeholder}
        suffix={
          <div hidden={!filters}>
            <CloseCircleOutlined
              className="xiudd-search-clear"
              style={{ display: search ? 'inline-block' : 'none' }}
              onClick={onClear}
            />
            <Popover
              visible={filterVisible}
              destroyTooltipOnHide={destroyFilterOnHide}
              trigger="click"
              getPopupContainer={ele => ele}
              content={
                <Filter
                  onFilter={handleFilter}
                  filters={filters}
                  filtered={search}
                />
              }
              overlayClassName="xiudd-search-cover-popover"
              placement="bottomRight"
              onVisibleChange={setFilterVisible}
            >
              <span
                onClick={onClickFilter}
                className="xiudd-search-filter-icon"
              >
                <XiuIcon type="iconshaixuan" />
                筛选
              </span>
            </Popover>
          </div>
        }
        value={value}
        onChange={inputChange}
        onKeyDown={stopPropagation}
        onPaste={stopPropagation}
      />
    </div>
  );
};

export default memo(forwardRef(Search));
