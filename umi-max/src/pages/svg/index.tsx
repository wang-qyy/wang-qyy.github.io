import SVGGradientEditor from './component';

function App() {
  return (
    <div className="app">
      <h1>SVG 渐变编辑器</h1>
      
      <SVGGradientEditor
        width={500}
        height={300}
        initialConfig={{
          type: 'linear',
          linearGradientProps: {
            x1: '0%',
            y1: '0%',
            x2: '100%',
            y2: '100%'
          }
        }}
        onConfigChange={(config) => {
          console.log('渐变配置已更新:', config);
        }}
      
      />
      
      <div className="usage-examples">
        <h2>使用说明：</h2>
        <ul>
          <li>点击SVG预览区域可以设置渐变的起点/中心点</li>
          <li>在控制点列表中点击选择要编辑的控制点</li>
          <li>可以添加、删除和调整颜色控制点</li>
          <li>底部会自动生成对应的SVG代码</li>
        </ul>
      </div>
    </div>
  );
}

export default App;