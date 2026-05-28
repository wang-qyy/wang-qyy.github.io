import { createSVGWithGradient, GradientPresets, GradientColor, generateGradientId } from './utils'


// React组件使用示例
function SVGColorExtractor() {

  // const gradient = GradientPresets.horizontal(['#FF0000', '#00FF00', '#0000FF'])

  let colors: GradientColor[] = []


  // Object.entries(GradientPresets).forEach(([key, value]) => {

  //   colors.push( value(['#FF0000', '#00FF00', '#0000FF']))

  // })

  colors.push(GradientPresets.horizontal(['rgba(218,39,39,1)', "#000"],
    { "x1": 0, "y1": 0.3, "x2": 0.9, "y2": 0 },
  ))
  colors.push(GradientPresets.horizontal(['rgba(218,39,39,1)', "#000"],
    { "x1": 0, "y1": 0.3, "x2": 0.9, "y2": 0 },
  ))

  const width = 200
  const gap = 8

  const shapes = colors.map((color, index) => ({
    type: 'rect',
    attributes: {
      x: index * 200 + (gap * (index - 1)),
      y: gap,
      width: width,
      height: width,
    },
    fill: `url(#${color.id})`,
  }))


  const svgW = shapes.length * width + gap * (shapes.length - 1)


  const svgStr = createSVGWithGradient({ width: svgW, height: width, shapes, gradients: colors })


  return (
    <div dangerouslySetInnerHTML={{ __html: svgStr }} style={{ height: 400 }}></div>
  );
}

export default SVGColorExtractor