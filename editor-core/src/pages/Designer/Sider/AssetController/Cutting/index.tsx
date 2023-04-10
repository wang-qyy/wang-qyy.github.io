import { Button } from 'antd';
import InfiniteLoader from '@/components/InfiniteLoader';
import { replaceMaskKey } from '@/utils/single';
import request from 'umi-request';
import { getMaskList } from '@/api/pictures';
import { XiuIcon } from '@/components';
import { useMaskClipByObserver, observer, assetBlur } from '@hc/editor-core';

import './index.less';

const OperationCutting = () => {
  const { inMask, resetMask, startMask, cancelMask, endMask } =
    useMaskClipByObserver();

  const replaceMaskClick = (data: any) => {
    if (!inMask) {
      startMask();
    }
    const params = {
      width: data.width,
      height: data.height,
      resId: data.id,
      SVGUrl: data.sample,
      source_key: data.source_key,
      rt_svgString: '',
    };
    request
      .get(data.source_key)
      .then(response => {
        if (response.stat === 1) {
          params.rt_svgString = response.msg;
          replaceMaskKey(params);
        }
      })
      .catch(error => {});
  };

  return (
    <div className="img-cutting-view">
      <div className="img-cutting-action">
        <Button className="img-cutting-action-button" onClick={cancelMask}>
          取消
        </Button>
        <Button
          className="img-cutting-action-button"
          onMouseDown={() => {
            resetMask();
            assetBlur();
          }}
        >
          重置
        </Button>
        <Button
          className="img-cutting-action-button"
          onMouseDown={() => {
            endMask();
            assetBlur();
          }}
        >
          确定
        </Button>
      </div>
      <div className="img-cutting-list-title">形状裁剪</div>

      <InfiniteLoader
        request={getMaskList}
        beforeLoadData={params => params.page}
        formatResult={res => {
          return { pageTotal: res?.data?.pageTotal, list: res?.data?.items };
        }}
        wrapStyle={{ flex: 1, height: 0, paddingBottom: 16 }}
        skeleton={{
          style: {
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))',
          },
        }}
      >
        {({ list }) => {
          return (
            <>
              {list.map(item => {
                return (
                  <div
                    key={item.id}
                    className="cutting-shape-box"
                    onClick={() => replaceMaskClick(item)}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `url(${item.preview}) center / contain no-repeat`,
                      }}
                    />
                  </div>
                );
              })}
            </>
          );
        }}
      </InfiniteLoader>
    </div>
  );
};

export default observer(OperationCutting);
