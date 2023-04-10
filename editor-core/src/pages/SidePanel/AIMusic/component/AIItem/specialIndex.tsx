import { XiuIcon } from '@/components';
import AIItem from '.';
import './index.less';

const AIItemSpecial = (props: {
  data: any;
  disabled?: boolean;
  playing?: boolean;
  className?: string;
}) => {
  const { playing = false, className, data, disabled = false } = props;
  return (
    <div className={`ai-item ${className}`} {...props}>
      {!data && (
        <>
          <div
            className="ai-item-icon"
            style={disabled && disabled ? { cursor: 'not-allowed' } : {}}
          >
            <XiuIcon type="iconbofang" />
          </div>
          <div className="ai-item-music">
            <div className="triangle" />
          </div>
        </>
      )}
      {data && <AIItem playing={playing} data={data} />}
    </div>
  );
};
export default AIItemSpecial;
