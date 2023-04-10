import { mouseMoveDistance } from '@/utils/single';
import { useSetState } from 'ahooks';
import { useMemo, useRef, useEffect } from 'react';
import { useAddSvgType } from '@/store/adapter/useGlobalStatus';
import { handleAddAsset } from '@/utils/assetHandler';
import { PathItem } from '@/kernel';
import { formatToPath, generatePath } from '@/kernel/utils/svgPath';
import { clickActionWeblog } from '@/utils/webLog';
import { ossEditorPath } from '@/config/urls';
import { RGBAToString } from '@/kernel/utils/single';
import styles from './index.less';
import { useCanvasScale } from '../../CanvasScale/handler';
import { getDefaultSvgInfo } from './options';

interface DrawAttr {
  width: number;
  height: number;
  left: number;
  top: number;
  pathItems?: PathItem[];
}

const SvgEditor = () => {
  const { setAddSvgType, addSvgType } = useAddSvgType();
  const wrapper = useRef<HTMLDivElement | null>(null);
  const {
    update,
    newCanvasInfo: { width: canvasWidth, height: canvasHeight, scale },
  } = useCanvasScale({
    container: document.querySelector('.xiudodo-main') as HTMLElement,
  });
  const canvasScale = (scale as number) || 1;
  const isLine = addSvgType === 'line';

  const [asset, updateAsset] = useSetState<DrawAttr>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const assetDataRef = useRef<DrawAttr | null>(null);
  assetDataRef.current = asset;

  const svgInfo = getDefaultSvgInfo();

  if (isLine) {
    svgInfo.strokeWidth = 4;
    svgInfo.closed = false;
  }

  const addAsset = () => {
    if (!assetDataRef.current) return;
    const { width, height, left, top, pathItems } = assetDataRef.current;
    handleAddAsset({
      attribute: {
        width,
        height,
        svgInfo: {
          ...svgInfo,
          pathItems,
        },
      },
      meta: {
        type: 'svgPath',
        shapeType: addSvgType || 'path',
      },
      transform: {
        posX: left,
        posY: top,
      },
    });
  };

  const onDraw = (e: React.MouseEvent) => {
    if (!wrapper.current) return;
    const { x: boundX, y: boundY } = wrapper.current.getBoundingClientRect();
    const startX = (e.clientX - boundX) / canvasScale;
    const startY = (e.clientY - boundY) / canvasScale;
    mouseMoveDistance(
      e,
      (x, y) => {
        const realX = x / canvasScale;
        const realY = y / canvasScale;
        const width = Math.abs(realX);
        const height = Math.abs(realY);
        const obj: DrawAttr = {
          width,
          height,
          left: startX,
          top: startY,
        };

        if (realX < 0) obj.left = startX + realX;
        if (realY < 0) obj.top = startY + realY;

        // 如果是线 则直接用pathItem绘制
        if (isLine) {
          const pathItem: PathItem = {
            start: [0, 0],
            end: [realX, realY],
          };
          if (realX < 0) {
            pathItem.start[0] = width;
            pathItem.end[0] = 0;
          }
          if (realY < 0) {
            pathItem.start[1] = height;
            pathItem.end[1] = 0;
          }
          obj.pathItems = [pathItem];
        }
        updateAsset(obj);
      },
      (x, y) => {
        if (x && y) {
          // 创建元素
          addAsset();
          clickActionWeblog('FreeformDraw2');
        } else {
          // 添加默认尺寸
          handleAddAsset({
            attribute: {
              width: 300,
              height: 300,
              svgInfo: { ...svgInfo },
            },
            meta: {
              type: 'svgPath',
              shapeType: addSvgType || 'path',
            },
            transform: {
              posX: startX,
              posY: startY,
            },
          });
        }
        setAddSvgType(null);
      },
    );
  };

  const pathItem = useMemo(() => {
    if (!asset.width || !asset.height || !addSvgType) return [];
    if (asset.pathItems) return asset.pathItems;
    return generatePath({
      width: asset.width,
      height: asset.height,
      type: addSvgType,
    });
  }, [asset.width, asset.height, addSvgType, asset.pathItems]);

  useEffect(() => {
    update('fit');
  }, []);

  return (
    <div
      ref={wrapper}
      className={styles.SvgEditor}
      onMouseDown={onDraw}
      style={{
        width: canvasWidth,
        height: canvasHeight,
        transform: `scale(${canvasScale})`,
        cursor: `url(${ossEditorPath('/image/cursor.svg')}) 15 15, crosshair`,
      }}
    >
      <div
        style={{
          left: asset.left,
          top: asset.top,
          position: 'absolute',
          width: asset.width,
          height: asset.height,
        }}
      >
        <svg
          // version="1.1"
          style={{
            overflow: 'inherit',
          }}
          width={asset.width}
          height={asset.height}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="null">
            <path
              style={{ vectorEffect: 'non-scaling-stroke' }}
              strokeWidth={isLine ? 4 : 0}
              d={formatToPath(pathItem)}
              strokeDasharray="none"
              stroke={RGBAToString(svgInfo.stroke)}
              fill={RGBAToString(svgInfo.fill)}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SvgEditor;
