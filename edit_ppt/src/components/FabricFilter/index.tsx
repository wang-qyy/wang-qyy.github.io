import React, { useLayoutEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Filters } from '@/kernel/typing';
import { useCreation, useDebounceFn, useUpdateEffect } from 'ahooks';

import { HandleFilter } from '@/kernel/Asset/Item/Image/utils/handleFilter';

interface IProps {
  src: string;
  style: React.CSSProperties;
  filters?: Partial<Filters>; // 用户调整值
}

const FabricImage = (props: IProps) => {
  const { style, filters } = props;

  let src = `${props.src}?time=${new Date().getDay()}`;
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
    };
  }, []);

  // 监听 替换
  useUpdateEffect(() => {
    handler?.updateImage(width, height, src);
    srcChange.current = true;
  }, [src]);

  return (
    <div style={style}>
      <canvas ref={canvasRef} />
    </div>
  );
};

FabricImage.defaultProps = {
  filters: undefined,
};

export default observer(FabricImage);
