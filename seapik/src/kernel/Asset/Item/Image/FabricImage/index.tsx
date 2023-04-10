import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Filters } from '@/kernel/typing';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import {
  useCreation,
  useDebounceFn,
  useThrottleFn,
  useUpdateEffect,
} from 'ahooks';
import { updateRecord } from '@/kernel/storeAPI';
import { assetIdPrefix } from '@/kernel/utils/const';
import { HandleFilter } from '../utils/handleFilter';

interface IProps {
  src: string;
  style: React.CSSProperties;
  filters?: Partial<Filters>; // 用户调整值
  asset: AssetItemState;
  // preset?: Partial<Filters>; // 预设
}

const FabricImage = (props: IProps) => {
  const { src = '', style, filters, asset } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // 当滤镜参数或者src变化
  const srcChange = useRef(true);
  const [layoutInit, _layoutInit] = useState(false);

  const width = window.parseInt(style.width as string);
  const height = window.parseInt(style.height as string);

  // 设置该元素的临时滤镜图片地址
  const { run: setBlob } = useDebounceFn(
    () => {
      canvasRef.current?.toBlob((blob) => {
        if (!blob || !srcChange.current) return;
        const url = URL.createObjectURL(blob);
        props.asset.update({ attribute: { rt_blob_url: url } });
        // 因为是异步回调 需要替换历史
        updateRecord();
        srcChange.current = false;
      });
    },
    {
      wait: 50,
    },
  );

  const handler = useCreation(() => {
    if (layoutInit && canvasRef.current) {
      const handleFilter = new HandleFilter({
        node: canvasRef.current,
        src,
        width,
        height,
        filters,
      });
      handleFilter.canvas.on('after:render', setBlob);
      return handleFilter;
    }
    handler?.dispose();
  }, [layoutInit]);

  useLayoutEffect(() => {
    _layoutInit(true);
    return () => {
      handler?.dispose();
      // handler.current = null;
    };
  }, []);

  const { run } = useThrottleFn(
    (params: Partial<Filters>) => {
      handler?.updateFilters(params);
    },
    {
      wait: 50,
    },
  );

  // 监听 替换 大小
  useUpdateEffect(() => {
    handler?.updateImage(width, height, src);
  }, [width, height, src]);

  useEffect(() => {
    srcChange.current = true;
  }, [src]);

  // 监听滤镜值变化
  useUpdateEffect(() => {
    run({ ...filters });
    srcChange.current = true;
  }, [Object.values(filters || {}).join()]);

  return (
    <div style={style}>
      <canvas data-asset-id={`${assetIdPrefix}${asset.id}`} ref={canvasRef} />
    </div>
  );
};

FabricImage.defaultProps = {
  filters: undefined,
};

export default observer(FabricImage);
