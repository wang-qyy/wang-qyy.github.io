import './index.less';
import { Slider } from 'antd';
const SWActionSlider = (props) => {
    const { caption = ["低", "高"], ...rest } = props || {};
    return (<div className='sw-action-slider-box'>
        <div className='sw-action-slider-tab'>{caption[0]}</div>
        <Slider {...rest} />
        <div className='sw-action-slider-tab'>{caption[1]}</div>
    </div>)
}
export default SWActionSlider;