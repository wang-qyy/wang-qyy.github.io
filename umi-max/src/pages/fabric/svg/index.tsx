import { util, Canvas, loadSVGFromString, loadSVGFromURL, Rect, Circle, parseSVGDocument, FabricObject, FabricImage } from 'fabric'
import { useEffect, useRef, useState } from 'react';
import { useUpdateEffect } from 'ahooks';

import { Slider, ColorPicker } from 'antd'
import { SVGClass } from './svgClass'

import { objectToFullSVG } from './utils'
const svgUrl = [
  // 'https://js.pngtree.com/editor/assets/svg_v_29.svg',
  'https://js.pngtree.com/editor/assets/svg_v_34.svg',
  // 'https://js.pngtree.com/editor/assets/svg_v_15.svg',
  // 'https://js.pngtree.com/editor/assets/svg_v_21.svg',
  // 'https://js.pngtree.com/editor/assets/svg_v_42.svg',
  // 'https://js.pngtree.com/editor/assets/svg_v_156.svg',
  // "https://js.pngtree.com/editor/assets/svg_v_31.svg"

]

// const svg_str = `<svg viewBox='0 0 600 600' > <g opacity='0.6' fill='pink'> <rect x="0" y="0" opacity='0.5' width="200" height="200" /> <rect x="200" y="0" width="100" height="50" fill="#000" /> </g> </svg>`
const svg_str = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 25.0.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [
	<!ENTITY ns_extend "http://ns.adobe.com/Extensibility/1.0/">
	<!ENTITY ns_ai "http://ns.adobe.com/AdobeIllustrator/10.0/">
	<!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/">
	<!ENTITY ns_vars "http://ns.adobe.com/Variables/1.0/">
	<!ENTITY ns_imrep "http://ns.adobe.com/ImageReplacement/1.0/">
	<!ENTITY ns_sfw "http://ns.adobe.com/SaveForWeb/1.0/">
	<!ENTITY ns_custom "http://ns.adobe.com/GenericCustomNamespace/1.0/">
	<!ENTITY ns_adobe_xpath "http://ns.adobe.com/XPath/1.0/">
]>
<svg version="1.1"
	 id="_x31_" xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;" xmlns:xml="http://www.w3.org/XML/1998/namespace"
	 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="600px" height="114.65px" viewBox="0 0 600 114.65"
	 enable-background="new 0 0 600 114.65" xml:space="preserve">
<switch>
	<foreignObject requiredExtensions="&ns_ai;" x="0" y="0" width="1" height="1">
		<i:aipgfRef  xlink:href="#adobe_illustrator_pgf">
		</i:aipgfRef>
	</foreignObject>
	<g i:extraneous="self">
		<g>
			<path fill="#FFC715" d="M571.45,113.12c-34.7,0-52.57-19.66-66.93-35.46c-14.09-15.51-22.98-24.28-41.66-24.28
				c-18.68,0-27.57,8.77-41.66,24.28c-14.36,15.8-32.23,35.46-66.92,35.46s-52.57-19.66-66.92-35.46
				c-14.09-15.51-22.98-24.28-41.66-24.28c-18.68,0-27.56,8.77-41.65,24.28c-14.36,15.8-32.22,35.46-66.92,35.46
				c-34.7,0-52.56-19.66-66.92-35.46C56.11,62.15,47.22,53.38,28.55,53.38c-9.43,0-17.07-7.64-17.07-17.07
				c0-9.43,7.64-17.07,17.07-17.07c34.7,0,52.57,19.66,66.92,35.46c14.1,15.51,22.98,24.28,41.65,24.28
				c18.67,0,27.57-8.78,41.65-24.28c14.35-15.8,32.22-35.46,66.92-35.46c34.7,0,52.57,19.66,66.93,35.46
				c14.09,15.51,22.97,24.28,41.65,24.28c18.69,0,27.57-8.78,41.66-24.28c14.35-15.8,32.22-35.46,66.92-35.46
				c34.7,0,52.57,19.66,66.94,35.46c14.09,15.51,22.97,24.28,41.66,24.28c9.43,0,17.07,7.64,17.07,17.07
				C588.52,105.48,580.88,113.12,571.45,113.12z"/>
		</g>
		<g>
			<path fill="#010101" d="M571.45,102.37c-36.24,0-54.68-20.29-69.5-36.6c-13.82-15.21-21.84-23.14-39.09-23.14
				c-17.25,0-25.26,7.94-39.09,23.14c-14.82,16.31-33.26,36.6-69.5,36.6c-36.25,0-54.68-20.3-69.49-36.6
				c-13.82-15.21-21.84-23.14-39.08-23.14c-17.24,0-25.26,7.94-39.08,23.14c-14.81,16.31-33.24,36.6-69.49,36.6
				c-36.24,0-54.68-20.3-69.5-36.6C53.8,50.56,45.79,42.63,28.55,42.63C17.22,42.63,8,33.41,8,22.08S17.22,1.53,28.55,1.53
				c36.25,0,54.68,20.3,69.49,36.6c13.82,15.21,21.84,23.14,39.08,23.14c17.25,0,25.26-7.93,39.07-23.14
				c14.82-16.31,33.26-36.6,69.5-36.6c36.24,0,54.68,20.3,69.5,36.6c13.82,15.21,21.83,23.14,39.08,23.14
				c17.24,0,25.26-7.93,39.09-23.14c14.82-16.31,33.26-36.6,69.5-36.6c36.25,0,54.69,20.3,69.51,36.6
				c13.82,15.21,21.84,23.14,39.09,23.14c11.33,0,20.55,9.22,20.55,20.55C592,93.15,582.78,102.37,571.45,102.37z M462.86,35.67
				c20.12,0,29.91,9.66,44.24,25.42c13.89,15.29,31.19,34.32,64.35,34.32c7.49,0,13.59-6.1,13.59-13.59
				c0-7.49-6.1-13.59-13.59-13.59c-20.11,0-29.91-9.66-44.24-25.42c-13.9-15.29-31.19-34.33-64.36-34.33
				c-33.17,0-50.46,19.03-64.35,34.33c-14.33,15.76-24.13,25.42-44.24,25.42c-20.1,0-29.9-9.66-44.22-25.42
				c-13.89-15.29-31.19-34.33-64.35-34.33c-33.16,0-50.45,19.03-64.35,34.33c-14.32,15.76-24.11,25.42-44.22,25.42
				c-20.1,0-29.9-9.66-44.23-25.42C79,27.52,61.72,8.49,28.55,8.49c-7.49,0-13.59,6.1-13.59,13.59c0,7.5,6.1,13.59,13.59,13.59
				c20.1,0,29.9,9.66,44.22,25.42c13.89,15.29,31.19,34.33,64.35,34.33c33.17,0,50.45-19.03,64.34-34.33
				c14.33-15.76,24.13-25.42,44.23-25.42c20.11,0,29.91,9.66,44.23,25.42c13.89,15.29,31.18,34.32,64.34,34.32
				c33.17,0,50.46-19.03,64.35-34.33C432.95,45.33,442.75,35.67,462.86,35.67z"/>
		</g>
	</g>
</switch>

</svg>
`

const canvasSize = {
  width: 800,
  height: 800
}

export default function SVGLoad() {

  const canvasRef = useRef<Canvas>()
  const previewRef = useRef<HTMLDivElement>(null)

  const [strokeW, setStrokeW] = useState(0);

  const instance = useRef<FabricObject>()

  function previewSvg(obj: FabricObject) {

    const { width, height } = obj.getBoundingRect()

    // const [width, height] = [obj.getScaledWidth(), obj.getScaledHeight()]

    // const svgStr = `<svg preserveAspectRatio='none' viewBox="0 0 ${Math.ceil(width)} ${Math.ceil(height)}">${obj.toSVG()}</svg>`
    const svgStr = objectToFullSVG(obj);
    previewRef.current!.innerHTML = svgStr

  }

  useEffect(() => {
    // const cl = new SVGClass()

    // cl.loadFromUrl(svgUrl[0]).then((result) => {
    //   console.log('loadFromUrl', result);

    // })

    // 确保 DOM 已经渲染，且元素存在
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvasElement) {
      canvasRef.current = new Canvas(canvasElement);

      svgUrl.forEach(url => {
        loadSVGFromURL(url)
        // loadSVGFromString(svg_str)
          .then(({ objects, options }) => {
            // 建议添加空值检查
            if (objects && canvasRef.current) {
              const group = util.groupSVGElements(objects, options);

              previewSvg(group)

              instance.current = group
              const groupSize = group.getBoundingRect()
              const scale = util.findScaleToFit(groupSize, canvasSize)

              console.log('getBoundingRect', groupSize);
              console.log('scaledSize', group.getScaledWidth());
              console.log('data:', scale, group.toJSON());

              group.set({
                // left: 0,
                // top: 0,
                scaleX: scale,
                scaleY: scale,
              })

              // const [width, height] = [instance.current.getScaledWidth(), instance.current.getScaledHeight()]

              canvasRef.current.setWidth(group.getScaledWidth())
              canvasRef.current.setHeight(group.getScaledHeight())
              canvasRef.current.setViewportTransform([0.5, 0, 0, 0.5, 0, 0])

              canvasRef.current.add(group);
              canvasRef.current.renderAll();
              console.log(canvasRef.current.toJSON())
            }
          }).catch(err => {
            console.error('Failed to load SVG:', err);
          });
      });
    }

    // 清理函数，避免内存泄漏
    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, []);

  useUpdateEffect(() => {
    if (instance.current) {

      instance.current.set({ strokeWidth: strokeW })

      canvasRef.current?.renderAll()

      previewSvg(instance.current)
    }

  }, [strokeW])


  function onChange(opts: Partial<FabricObject>) {
    if (instance.current) {
      instance.current.set(opts)

      canvasRef.current?.renderAll()

      previewSvg(instance.current)
    }

  }

  return (
    <>
      <ColorPicker

        mode={['single', 'gradient']}

        onChange={(value, css) => {
          onChange({ stroke: value.toHexString() })
console.log(value)
          console.log(value.getColors(),value.isGradient(),value.toCssString())

        }} />
      <Slider value={strokeW} onChange={(w) => {

        if (instance.current) {
          const [width, height] = [instance.current.getScaledWidth(), instance.current.getScaledHeight()]

          console.log({
            width,
            height
          });


          onChange({ strokeWidth: w, strokeDashArray: [w * 2, w * 2], width: width - w, height: height - w })
        }
      }} />
      <div style={{ backgroundColor: '#eee' }}>
        <canvas id='canvas' width={canvasSize.width} height={canvasSize.height}></canvas>

        <div ref={previewRef} className='preview-svg' style={{ width: 300, height: 300 }}></div>


        {/* <div style={{ width: 300, height: 600, background: 'pink' }}>

        <svg viewBox='0 0 600 600'>
          <g>
            <rect x="0" y="0" width="200" height="200" fill="#D9D9D9" />
            <rect x="200" y="0" width="100" height="50" fill="#000" />
          </g>
        </svg>
      </div> */}
      </div>
    </>
  );
}
