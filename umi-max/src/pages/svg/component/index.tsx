import  { useState, useCallback, useRef, useEffect } from 'react';
import './index.css';

interface ColorStop {
  id: string;
  offset: number;
  color: string;
  opacity?: number;
}

interface GradientConfig {
  id: string;
  type: 'linear' | 'radial';
  colorStops: ColorStop[];
  linearGradientProps?: {
    x1?: string;
    y1?: string;
    x2?: string;
    y2?: string;
  };
  radialGradientProps?: {
    cx?: string;
    cy?: string;
    r?: string;
    fx?: string;
    fy?: string;
  };
}

interface SVGGradientEditorProps {
  width?: number;
  height?: number;
  initialConfig?: Partial<GradientConfig>;
  onConfigChange?: (config: GradientConfig) => void;
}

const SVGGradientEditor: React.FC<SVGGradientEditorProps> = ({
  width = 400,
  height = 300,
  initialConfig = {},
  onConfigChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = `gradient-sss`;
  
  const defaultConfig: GradientConfig = {
    id: gradientId,
    type: 'linear',
    colorStops: [
      { id: '1', offset: 0, color: '#ff0000', opacity: 1 },
      { id: '2', offset: 0.5, color: '#00ff00', opacity: 1 },
      { id: '3', offset: 1, color: '#0000ff', opacity: 1 }
    ],
    linearGradientProps: {
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%'
    },
    radialGradientProps: {
      cx: '50%',
      cy: '50%',
      r: '50%'
    }
  };

  const [config, setConfig] = useState<GradientConfig>({
    ...defaultConfig,
    ...initialConfig,
    id: gradientId,
    colorStops: initialConfig.colorStops || defaultConfig.colorStops
  });

  const [selectedStopId, setSelectedStopId] = useState<string>(
    config.colorStops[0]?.id || ''
  );

  const selectedStop = config.colorStops.find(stop => stop.id === selectedStopId);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const handleAddStop = useCallback(() => {
    const newId = Date.now().toString();
    const newStops = [...config.colorStops];
    const newOffset = 0.5;
    
    newStops.push({
      id: newId,
      offset: newOffset,
      color: '#ffffff',
      opacity: 1
    });

    newStops.sort((a, b) => a.offset - b.offset);

    setConfig(prev => ({
      ...prev,
      colorStops: newStops
    }));
    setSelectedStopId(newId);
  }, [config.colorStops]);

  const handleRemoveStop = useCallback((stopId: string) => {
    if (config.colorStops.length <= 2) return;

    const newStops = config.colorStops.filter(stop => stop.id !== stopId);
    setConfig(prev => ({
      ...prev,
      colorStops: newStops
    }));

    if (selectedStopId === stopId && newStops.length > 0) {
      setSelectedStopId(newStops[0].id);
    }
  }, [config.colorStops.length, selectedStopId]);

  const handleStopChange = useCallback((stopId: string, updates: Partial<ColorStop>) => {
    setConfig(prev => ({
      ...prev,
      colorStops: prev.colorStops.map(stop =>
        stop.id === stopId ? { ...stop, ...updates } : stop
      )
    }));
  }, []);

  const handleOffsetChange = useCallback((stopId: string, newOffset: number) => {
    const clampedOffset = Math.max(0, Math.min(1, newOffset));
    const newStops = config.colorStops.map(stop =>
      stop.id === stopId ? { ...stop, offset: clampedOffset } : stop
    );

    newStops.sort((a, b) => a.offset - b.offset);

    setConfig(prev => ({
      ...prev,
      colorStops: newStops
    }));
  }, [config.colorStops]);

  const handleGradientTypeChange = useCallback((type: 'linear' | 'radial') => {
    setConfig(prev => ({
      ...prev,
      type
    }));
  }, []);

  const handleLinearPropChange = useCallback((prop: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      linearGradientProps: {
        ...prev.linearGradientProps,
        [prop]: value
      }
    }));
  }, []);

  const handleRadialPropChange = useCallback((prop: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      radialGradientProps: {
        ...prev.radialGradientProps,
        [prop]: value
      }
    }));
  }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (config.type === 'linear') {
      handleLinearPropChange('x1', `${(x * 100).toFixed(1)}%`);
      handleLinearPropChange('y1', `${(y * 100).toFixed(1)}%`);
    } else {
      handleRadialPropChange('cx', `${(x * 100).toFixed(1)}%`);
      handleRadialPropChange('cy', `${(y * 100).toFixed(1)}%`);
    }
  }, [config.type, handleLinearPropChange, handleRadialPropChange]);

  const gradientDefinition = config.type === 'linear' ? (
    <linearGradient
      id={config.id}
      {...config.linearGradientProps}
    >
      {config.colorStops.map(stop => (
        <stop
          key={stop.id}
          offset={`${stop.offset * 100}%`}
          stopColor={stop.color}
          stopOpacity={stop.opacity}
        />
      ))}
    </linearGradient>
  ) : (
    <radialGradient
      id={config.id}
      {...config.radialGradientProps}
    >
      {config.colorStops.map(stop => (
        <stop
          key={stop.id}
          offset={`${stop.offset * 100}%`}
          stopColor={stop.color}
          stopOpacity={stop.opacity}
        />
      ))}
    </radialGradient>
  );

  console.log(config.id);
  

  return (
    <div className="svg-gradient-editor">
      <div className="preview-section">
        <h3>预览</h3>
        <div className="svg-container">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            onClick={handleSvgClick}
            className="gradient-svg"
          >
            <defs>
              {gradientDefinition}
            </defs>
            
          
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${config.id})`}
              />
         
          </svg>
        </div>
      </div>

      <div className="controls-section">
        <h3>渐变配置</h3>
        
        <div className="gradient-type-selector">
          <label>渐变类型：</label>
          <div className="type-buttons">
            <button
              className={config.type === 'linear' ? 'active' : ''}
              onClick={() => handleGradientTypeChange('linear')}
            >
              线性渐变
            </button>
            <button
              className={config.type === 'radial' ? 'active' : ''}
              onClick={() => handleGradientTypeChange('radial')}
            >
              径向渐变
            </button>
          </div>
        </div>

        {config.type === 'linear' && config.linearGradientProps && (
          <div className="gradient-props">
            <h4>线性渐变参数</h4>
            {Object.entries(config.linearGradientProps).map(([key, value]) => (
              <div key={key} className="prop-control">
                <label>{key}:</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleLinearPropChange(key, e.target.value)}
                  placeholder="如: 0%, 50%"
                />
              </div>
            ))}
          </div>
        )}

        {config.type === 'radial' && config.radialGradientProps && (
          <div className="gradient-props">
            <h4>径向渐变参数</h4>
            {Object.entries(config.radialGradientProps).map(([key, value]) => (
              <div key={key} className="prop-control">
                <label>{key}:</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleRadialPropChange(key, e.target.value)}
                  placeholder="如: 50%, 30%"
                />
              </div>
            ))}
          </div>
        )}

        <div className="color-stops-section">
          <div className="section-header">
            <h4>颜色控制点</h4>
            <button
              className="add-stop-btn"
              onClick={handleAddStop}
            >
              添加控制点
            </button>
          </div>

          <div className="stops-list">
            {config.colorStops.map(stop => (
              <div
                key={stop.id}
                className={`stop-item ${selectedStopId === stop.id ? 'selected' : ''}`}
                onClick={() => setSelectedStopId(stop.id)}
              >
                <div className="stop-preview" style={{ backgroundColor: stop.color }} />
                <div className="stop-info">
                  <span>位置: {Math.round(stop.offset * 100)}%</span>
                  <span>颜色: {stop.color}</span>
                </div>
                {config.colorStops.length > 2 && (
                  <button
                    className="remove-stop-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStop(stop.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedStop && (
            <div className="stop-controls">
              <h4>编辑控制点</h4>
              <div className="control-group">
                <label>位置: {Math.round(selectedStop.offset * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedStop.offset * 100}
                  onChange={(e) => handleOffsetChange(
                    selectedStop.id,
                    parseInt(e.target.value) / 100
                  )}
                />
              </div>
              
              <div className="control-group">
                <label>颜色</label>
                <input
                  type="color"
                  value={selectedStop.color}
                  onChange={(e) => handleStopChange(selectedStop.id, { 
                    color: e.target.value 
                  })}
                />
                <input
                  type="text"
                  value={selectedStop.color}
                  onChange={(e) => handleStopChange(selectedStop.id, { 
                    color: e.target.value 
                  })}
                  placeholder="#RRGGBB"
                />
              </div>
              
              <div className="control-group">
                <label>透明度: {selectedStop.opacity?.toFixed(2) || 1}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedStop.opacity || 1}
                  onChange={(e) => handleStopChange(selectedStop.id, { 
                    opacity: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="export-section">
          <h4>导出代码</h4>
          <textarea
            readOnly
            value={`
<svg width="${width}" height="${height}">
  <defs>
    ${config.type === 'linear' ? `
    <linearGradient id="${config.id}" ${
      Object.entries(config.linearGradientProps || {})
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
    }>
      ${config.colorStops.map(stop => 
        `  <stop offset="${stop.offset * 100}%" stop-color="${stop.color}"${
          stop.opacity !== undefined && stop.opacity !== 1 
            ? ` stop-opacity="${stop.opacity}"` 
            : ''
        }/>`
      ).join('\n      ')}
    </linearGradient>` : `
    <radialGradient id="${config.id}" ${
      Object.entries(config.radialGradientProps || {})
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
    }>
      ${config.colorStops.map(stop => 
        `  <stop offset="${stop.offset * 100}%" stop-color="${stop.color}"${
          stop.opacity !== undefined && stop.opacity !== 1 
            ? ` stop-opacity="${stop.opacity}"` 
            : ''
        }/>`
      ).join('\n      ')}
    </radialGradient>`}
  </defs>
  <!-- 使用示例 -->
  <rect x="0" y="0" width="100%" height="100%" fill="url(#${config.id})" />
</svg>
            `.trim()}
            rows={10}
          />
        </div>
      </div>
    </div>
  );
};

export default SVGGradientEditor;