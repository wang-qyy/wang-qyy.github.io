import { replaceMaskKey } from '@/utils/single';
import request from 'umi-request';
import './index.less';

const ClipMaskItem = (propsItem: any) => {
  const { item, className, type = 'list' } = propsItem;
  const replaceMaskClick = (data: any) => {
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
    <>
      <div className={className || 'clip-mask-item'}>
        <div
          onClick={() => replaceMaskClick(item)}
          style={{
            width: type === 'index' ? 28 : 40,
            height: type === 'index' ? 28 : 40,
            backgroundImage: `url(${item.preview})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </>
  );
};
export default ClipMaskItem;
