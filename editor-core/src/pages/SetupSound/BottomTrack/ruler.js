import { formatNumberToTime } from '@/utils/single';

function format(number, type) {
  switch (type) {
    case 'time':
      return formatNumberToTime(parseInt(`${number}`, 10));
    default:
      return number.toString();
  }
}

export const ruler = {
  /**
   * 初始化刻度尺插件
   * @el 容器 String
   * @height 刻度尺高度 Number
   * @maxScale 最大刻度 Number
   * @startValue 开始的值 Number
   * @region 区间 Array
   * @background 刻度尺背景颜色 String
   * @color 刻度线和字体的颜色 String
   * @markColor  中心刻度标记颜色 String
   * @isConstant 是否不断地获取值 Boolean
   * @success(res) 滑动结束后的回调 Function
   * @unit 单位 String
   * @format 坐标数字类型string - number|time
   * */

  initPlugin(params) {
    const initParams = {
      el: params.el,
      scenario: params.scenario,
      height: params.height || 60,
      maxScale: params.maxScale || 200,
      startValue: params.startValue || 0,
      region: params.region || false,
      background: params.background || false,
      color: params.color || false,
      markColor: params.markColor || '#FFCC33',
      isConstant: params.isConstant || false,
      unit: params.unit ?? 's',
      format: params.format ?? 'number',
    };

    if (!initParams.el) {
      return false;
    }

    const rulerWrap = initParams.el.current; // 获取容器

    // document.getElementById(initParams.el);
    rulerWrap.style.height =
      initParams.height < 30 ? `${30}px` : `${initParams.height}px`;

    // 最大刻度的小值是50
    // initParams.maxScale = initParams.maxScale < 50 ? 50 : initParams.maxScale;

    if (initParams.startValue > initParams.maxScale) {
      initParams.startValue = initParams.maxScale;
    }

    let minSildeNum = 0; // 最小滑动的值
    let maxSildeNum = initParams.maxScale; // 最大滑动的值

    if (initParams.region) {
      minSildeNum = Math.floor(initParams.region[0]);
      maxSildeNum = Math.floor(initParams.region[1]);
    }

    const count = initParams.startValue; // 初始值

    const winWidth = rulerWrap.offsetWidth; // 容器宽度

    const n =
      initParams.maxScale < 100 ? 1 : Math.floor(initParams.maxScale / 100);

    const t = initParams.maxScale / 10;

    const division = (winWidth / initParams.maxScale) * n; // 每个刻度的距离 分割线
    // 刻度值数组
    const scaleValueList = [];
    for (let i = 0; i <= t; i += n) {
      scaleValueList.push(i);
    }

    let canvas = rulerWrap.getElementsByTagName('canvas')[0]; // 获取容器下的canvas标签
    // 没有canvas就创建一个
    if (!canvas) {
      canvas = document.createElement('canvas'); // 创建canvas标签
      canvas.width = winWidth;
      canvas.height = initParams.height;
      rulerWrap.appendChild(canvas);
    }
    const cxt = canvas.getContext('2d');

    if (1) {
      canvas.width = 1 * winWidth;
      canvas.height = 1 * initParams.height;
      cxt.scale(1, 1);
    }

    // 画刻度尺
    function drawRuler(count) {
      // count = count;

      // 清空画布
      cxt.clearRect(0, 0, winWidth, initParams.height);

      // 刻度尺背景
      if (initParams.background) {
        cxt.fillStyle = initParams.background;
        cxt.fillRect(0, 0, canvas.width, initParams.height);
      }

      // 画刻度线
      for (let i = 0; i < initParams.maxScale; i++) {
        cxt.beginPath();
        cxt.save();
        cxt.strokeStyle = initParams.color ? initParams.color : '#bbb';
        cxt.lineWidth = 1;
        cxt.lineCap = 'round';
        cxt.moveTo(division * i - count * division, 0);
        cxt.lineTo(
          division * i - count * division,
          Math.floor(initParams.height * 0.3),
        );

        if (i % 5 === 0) {
          cxt.strokeStyle = initParams.color ? initParams.color : '#999';
          cxt.lineTo(
            division * i - count * division,
            Math.floor(initParams.height * 0.35),
          );
        }
        if (i % 10 === 0) {
          cxt.strokeStyle = initParams.color ? initParams.color : '#666';
          cxt.lineTo(
            division * i - count * division,
            Math.floor(initParams.height * 0.52),
          );
        }

        cxt.stroke();
        cxt.restore();
        cxt.closePath();
      }
      // 添加坐标数字
      cxt.beginPath();
      cxt.font = '12px Arial';
      cxt.fillStyle = initParams.color ?? '#333';
      cxt.textBaseline = 'middle';

      const scaleValueListLength = scaleValueList.length - 1;
      scaleValueList.forEach((num, i) => {
        const text = `${format(num, initParams.format)}${initParams.unit}`;
        const textAlign = 'left';
        let positionX = division * i * 10 - count * division;
        const positionY = Math.floor(initParams.height * 0.78);

        if (num > 0) {
          positionX -= 14;
        }

        cxt.textAlign = textAlign;
        cxt.fillText(text, positionX, positionY);
      });
      cxt.closePath();

      // 中心刻度线
      cxt.beginPath();
      cxt.save();
      cxt.strokeStyle = initParams.markColor;
      cxt.lineWidth = 1;
      cxt.lineCap = 'round';
      initParams.scenario.forEach(num => {
        cxt.moveTo(num * winWidth, 0);
        cxt.lineTo(num * winWidth, Math.floor(initParams.height * 1));
      });

      cxt.stroke();
      cxt.restore();
      cxt.closePath();
    }

    if (1) {
      canvas.style.transform = `scale(${1 / 1})`;
      canvas.style.transformOrigin = 'left top';
    }

    drawRuler(count);

    // 滑动相关
    let initX = 0; // 初始x 距离

    if (!canvas) return false;

    let isMouseDown = false; // 鼠标是否按下

    // 鼠标按下
    canvas.addEventListener(
      'click',
      function (e) {
        isMouseDown = true;
        initX = e.layerX;
        params.success && params.success(initX / winWidth);
      },
      false,
    );
  },
};
