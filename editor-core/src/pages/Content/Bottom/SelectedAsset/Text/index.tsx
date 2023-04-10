import classNames from 'classnames';
import './index.less';

export default function Text({
  text,
  className,
}: {
  text: string[];
  className?: string;
}) {
  return (
    <div className="selected-asset-text-wrapper">
      <div className={classNames('selected-asset-text', className)}>{text}</div>
    </div>
  );
}
