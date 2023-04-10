import { PATHLIST } from '@/constants/animation';
import usePathHook, { pathProps } from '../hooks';
import './index.modules.less';
import Lottie from '@/components/Lottie';

const PathAnimationList = (props: { visible: boolean }) => {
  const { visible } = props;
  const { setAnimation } = usePathHook();
  // 选中动画
  const chooseAnimation = (data: pathProps) => {
    setAnimation(data);
  };
  return (
    <div className="path-animation-list" style={{ opacity: visible ? 1 : 0 }}>
      {PATHLIST.map((item, index) => {
        return (
          <div
            className="path-animation-item"
            key={index}
            onClick={() => {
              chooseAnimation(item);
            }}
          >
            <div className="preview">
              <Lottie path={item.poster} preview={item.url} />
            </div>
            {/* <div className="text">{item.desc}</div> */}
          </div>
        );
      })}
    </div>
  );
};
export default PathAnimationList;
