import classNames from 'classnames';
import './index.less';

const imgList = [
  'https://js.xiudodo.com/colorful/materials/pattern1.png',
  'https://js.xiudodo.com/colorful/materials/pattern2.png',
  'https://js.xiudodo.com/colorful/materials/pattern3.png',
  'https://js.xiudodo.com/colorful/materials/pattern4.png',
  'https://js.xiudodo.com/colorful/materials/pattern5.png',
  'https://js.xiudodo.com/colorful/materials/pattern6.png',
  'https://js.xiudodo.com/colorful/materials/pattern81.jpg',
  'https://js.xiudodo.com/colorful/materials/pattern82.jpg',
  'https://js.xiudodo.com/colorful/materials/pattern83.jpg',
  'https://js.xiudodo.com/colorful/materials/pattern84.jpg',
];
const EffectImage = (props: {
  defaultUrl: string;
  onChange: (url: string) => void;
}) => {
  const { defaultUrl, onChange } = props;
  return (
    <div className="effect-image">
      {imgList.map((ele, index) => {
        return (
          <div
            key={ele}
            onClick={() => {
              onChange(ele);
            }}
            className={classNames('effect-image-item', {
              'item-choosed': defaultUrl === ele,
            })}
          >
            <div
              style={{
                background: `url(${ele}) no-repeat left center`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
export default EffectImage;
