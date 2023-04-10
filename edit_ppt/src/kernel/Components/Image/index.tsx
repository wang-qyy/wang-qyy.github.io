import React, { ImgHTMLAttributes, forwardRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { loadImage } from '@kernel/store';

// eslint-disable-next-line react/display-name
const Image = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  (props, ref) => {
    // eslint-disable-next-line react/prop-types
    const { src = '', alt = 'image' } = props;

    useEffect(() => {
      loadImage(src);
    }, []);

    function onLoad(e: any) {
      loadImage(src, true);
      // eslint-disable-next-line react/prop-types
      props?.onLoad?.(e);
    }

    function onError(e: any) {
      loadImage(src, false);
      // eslint-disable-next-line react/prop-types
      props?.onError?.(e);
    }

    return (
      <img alt={alt} {...props} ref={ref} onLoad={onLoad} onError={onError} />
    );
  },
);

export default observer(Image);
