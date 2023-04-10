import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { useUpdateLoadStatus } from '@kernel/store/AssetAdapter';
import { BrokenLine, Pie, Funnel, Histogram } from './item';

export default observer(
  ({ asset, canvasInfo, isPreviewMovie }: AssetItemProps) => {
    const LoadStatus = useUpdateLoadStatus(asset, !!isPreviewMovie);

    // @ts-ignore
    const { chartBaseType } = window.global_const;
    const chartProps = {
      asset,
      canvas: canvasInfo,
      LoadComplete: LoadStatus.loadSuccess,
    };
    let ChartIns = <div />;
    if (asset.attribute.chartBaseId == chartBaseType.brokenLine) {
      // 折线图（面积图）
      ChartIns = <BrokenLine {...chartProps} />;
    } else if (asset.attribute.chartBaseId == chartBaseType.pie) {
      // 饼图（环形图）
      ChartIns = <Pie {...chartProps} />;
    } else if (asset.attribute.chartBaseId == chartBaseType.funnel) {
      // 漏斗（金字塔）
      ChartIns = <Funnel {...chartProps} />;
    } else if (asset.attribute.chartBaseId == chartBaseType.histogram) {
      // 柱状图（条形图）
      ChartIns = <Histogram {...chartProps} />;
    }
    return (
      <div className="assetChart" ref="assetChart">
        <div style={{ position: 'absolute' }} />
        {asset.attribute.rt_ready && ChartIns}
        {!asset.attribute.rt_ready && (
          <div>
            <i className="iconfont icon-xuanzhuan assetImgLoad" />
          </div>
        )}
      </div>
    );
  },
);
