import { FabricImage } from 'fabric'

// 防止打包的时候 这个模块的代码被摇树化，因为这个模块没有导出
// 不然的话 底下的代码 在打包的时候 会被摇树化
export const Rollup_build_treeshake__ = false
// export const Rollup_build_treeshake0__ = false

/**
 * 由于 重写的 FabricImage 类中，有很多处理 img加载中 的代码逻辑，
 * 这些代码 在 [Server 静态页面项目中] StaticCanvas 渲染的，是不需要有加载中效果
 *
 * 所以 这个文件中 只是重写的了 fabric 内部的一些代码逻辑，
 */
FabricImage.prototype._renderFill = function (ctx: CanvasRenderingContext2D) {
  const elementToDraw = this._element as HTMLImageElement | undefined
  if (!elementToDraw) {
    return
  }

  const scaleX = this._filterScalingX,
    scaleY = this._filterScalingY,
    w = this.width,
    h = this.height,
    // ============================================
    // ============================================

    /**
     * @rewrite 改动了 fabric 使 裁剪坐标可以 小于0
     */
    cropX = this.cropX,
    cropY = this.cropY,
    // crop values cannot be lesser than 0.
    // cropX = Math.max(this.cropX, 0),
    // cropY = Math.max(this.cropY, 0),

    // ============================================
    // ============================================

    elWidth = elementToDraw.naturalWidth || elementToDraw.width,
    elHeight = elementToDraw.naturalHeight || elementToDraw.height,
    sX = cropX * scaleX,
    sY = cropY * scaleY,
    // the width height cannot exceed element width/height, starting from the crop offset.
    sW = Math.min(w * scaleX, elWidth - sX),
    sH = Math.min(h * scaleY, elHeight - sY),
    x = -w / 2,
    y = -h / 2,
    maxDestW = Math.min(w, elWidth / scaleX - cropX),
    maxDestH = Math.min(h, elHeight / scaleY - cropY)

  elementToDraw &&
    ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, maxDestW, maxDestH)
}
