import { XiuIcon } from '@/components';
import { memo } from 'react';
import AduioItem from '../../component/AduioItem';
import './index.less';

interface RoleItemProps {
  data: any;
  choosed: boolean;
  onSelect: (val: string) => void;
}
const RoleItem = (props: RoleItemProps) => {
  const { data, choosed = false, onSelect } = props;
  const clickChange = () => {
    onSelect(data.voice_key);
  };
  return (
    <div
      className={`role-item ${choosed ? 'role-item-choosed' : ''}`}
      onClick={clickChange}
    >
      <div className="role-item-pic">
        <img src={data.cover_url} alt={data.voice_name} />
      </div>
      <div className="role-item-right">
        <div className="role-item-right-title">
          {data.voice_name}
          <AduioItem
            className="title-icon"
            value={{
              id: '1',
              total_time: 0,
              preview: data.sample_url,
            }}
          />
        </div>
        <div className="role-item-right-desc">{data?.description}</div>
      </div>
    </div>
  );
};
export default memo(RoleItem);
