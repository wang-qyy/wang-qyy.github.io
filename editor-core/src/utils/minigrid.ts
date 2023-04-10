export function minigrid(
  containerSelector: string,
  itemSelector: string,
  gutter?: number,
  callback?: Function,
) {
  gutter = gutter || 6;

  const { forEach } = Array.prototype;
  const containerEle: HTMLElement | null =
    document.querySelector(containerSelector);
  if (!containerEle) return;

  const itemsNodeList = document.querySelectorAll(itemSelector);
  // return;

  let containerWidth: string | number = 334;
  if (containerEle) {
    containerEle.style.width = '';
    containerWidth = containerEle.getBoundingClientRect().width;
  }

  // console.log(containerWidth);

  const firstChildWidth =
    itemsNodeList[0]?.getBoundingClientRect().width + gutter || 156;
  const cols = Math.max(Math.floor(containerWidth / firstChildWidth), 1);

  console.log('cols', firstChildWidth, containerWidth, cols);

  containerWidth = `${firstChildWidth * cols + gutter}px`;
  containerEle.style.width = containerWidth;

  const itemsGutter: Array<number> = [];
  const itemsPosX: Array<number> = [];

  for (let g = 0; g < cols; g++) {
    // console.log(cols, g, g * firstChildWidth);
    if (g % cols !== 0) {
      itemsPosX.push(g * firstChildWidth + gutter);
    } else {
      itemsPosX.push(0);
    }

    itemsGutter.push(gutter);
  }

  // console.log(cols, itemsPosX, itemsGutter);

  forEach.call(itemsNodeList, item => {
    let itemIndex: number | undefined =
      itemsGutter
        .slice(0)
        .sort((a, b) => {
          return a - b;
        })
        .shift() || -1;

    itemIndex = itemsGutter.indexOf(itemIndex);
    const posX = itemsPosX[itemIndex];
    const posY = itemsGutter[itemIndex];

    const transformProps = [
      'webkitTransform',
      'MozTransform',
      'msTransform',
      'OTransform',
      'transform',
    ];
    forEach.call(transformProps, transform => {
      // item.style[transform] = `translate(${posX}px,${posY}px)`;
      item.style.top = `${posY}px`;
      item.style.left = `${posX}px`;
    });
    itemsGutter[itemIndex] += item.getBoundingClientRect().height + gutter;
  });

  const containerHeight = itemsGutter
    .slice(0)
    .sort((a, b) => {
      return a - b;
    })
    .pop();

  containerEle.style.height = `${containerHeight}px`;

  if (typeof callback === 'function') {
    callback();
  }
}
