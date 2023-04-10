export interface SpecialEffectsItem {
  asset: {
    attribute: {
      effectVariant: {
        _id: string;
        version: number;
        rt_name: string;
        rt_defaultFontFamily: string;
        rt_variantNames: [];
        rt_variantColors: [];
        rt_variantList: [];
        layers: [
          {
            zindex: 10;
            color: { r: 255; g: 118; b: 162; a: 1 };
            top: 0.05;
            left: 0;
            strokeColor: { r: 1; g: 60; b: 195; a: 1 };
            strokeWidth: 0.0125;
          },
          {
            zindex: 20;
            color: { r: 255; g: 255; b: 255; a: 1 };
            top: 0;
            left: 0;
            strokeColor: { r: 1; g: 60; b: 195; a: 1 };
            strokeWidth: 0.0125;
          },
        ];
        // 特效字中可变颜色
        variableColorPara: [
          {
            colors: [{ index: 0; key: 'color' }];
            colorBlock: { r: 119; g: 195; b: 255; a: 1 };
          },
          {
            colors: [{ index: 1; key: 'color' }];
            colorBlock: { r: 255; g: 255; b: 255; a: 1 };
          },
        ];
      };
    };
  };
}
