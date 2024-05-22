### 接口 doc 描述

> doc 总体结构

```json
{
    "assets":[
        [
            {
                "meta":{},
                "attribute":{},
                "transform":{},
                "assets":[
                    {
                        "meta":{},
                        "attribute":{},
		                "transform":{}
                    }
                ]
            },// 每页的每个内容都是这样的对象
        ],
        ...
    ],
    "width":1920,
    "height":1080,
    "scale":0.3
}
```

> 每页的每个内容

```json
{
  "meta": {
    "type": "mask|image|text|module|svg" //module为组,mask为svg遮罩形状 SVG和svgpath和pic需要待确认
  }
}
```

```json

{
    "meta":{
        type:'',

    }
    "attribute:{
    	"width":1234,
    	"height":442,
    	"viewBox":{//如果设置viewBox 会和attribute.width,height比较计算出 缩放比例, 不设缩放为1
            "x":0,
            "y":0,
    		"width":1234,
    		"height":442
		},
		"svg_obj":[
            {
                "operation":"exclude|union|subtract|intersect",//默认为union  合并形状填充形状内部  exclude排查重叠形状   subtract减去顶层形状   intersect与形状区域相交
                "type":"path|rect|circle|ellipse|line|polyline|polygon",
                // path
                	"d":"M150 0 L75 200 L225 200 Z",
                	"x":11,"y":11,//如果没有设置x,y 则使用transform的posX,posY
                	"width":11,"height":11,//如果没有设置 则使用attribute的width,height
                //rect 左上角+宽高
                	"x":"50","y":"20","width":"150","height":"150",
                	"rx":15,//圆角半径如果设置是相对于最小边
                //circle 圆心+半径
                	"cx":"100","cy":"50","r":"40",
                //ellipse 中心+横轴竖轴
                	"cx":"300","cy":"80","rx":"100","ry":"50",
                //line 两个点
                	"x1":"0","y1":"0","x2":"200","y2":"200",
                //polygon 点集合
                	"points":"100,10 40,198 190,78 10,78 160,198",
                //polyline
                	"points":"20,20 40,25 60,40 80,120 120,140 200,180",

                "opacity":1.0,//透明度 0-1 可以不传 默认1
                //fill
                	// 如果没有fill 则会 使用attribute中的颜色相关信息 colors有渐变信息 color{r,g,b,a 0-1}
                	"fill":"#RRGGBB",//rgb
                	"fill":"#RRGGBBAA",//rgba a和stroke-opacity 会相乘
                	"fill":{
                        "r":255,//0-255
                        "g":255,
                        "b":255,
                        "a":1,//0-1 可以不传 默认为1 最终计算 a*opacity
                    },
                	"fill":{
                        "type":"linear",//线性渐变
                        "angle":90.0,//角度
                        "colorStops":[
                            {
                                "color":{
                                    "r":255,
                                    "g":255,
                                    "b":255,
                                    "a":1,//0-1 最终计算 a*opacity
                                },
                                "offset":0.5,//位置 0-1之间
                            }
                        ]
                    }

                "stroke-opacity":1.0,//透明度 0-1 可以不传 默认1
                //stroke 边框
                	"stroke":"#RRGGBB",//rgb
                	"stroke":"#RRGGBBAA",//rgba 其中 a和stroke-opacity 会相乘
                	"stroke":{
                        "r":255,//0-255
                        "g":255,
                        "b":255,
                        "a":1,//0-1 可以不传 默认为1 最终计算 a*stroke-opacity
                    }
                "stroke-width":1.0,//轮廓的宽度
                "stroke-linejoin":"miter|round|bevel",//bevel 用斜角连接路径段; miter 用尖角连接路径段;round 使用圆角连接路径片段
                "stroke-linecap":"butt|round|square",//butt 线条的两端为平行的边缘 round向线条的两端添加半圆形线帽 square向线条的两端添加正方形线帽
                "stroke-dasharray":"0,0"//描边的点划线的图案, 需要偶数个数值 多个数值用逗号隔开 0,0表示实线  短划线,缺口依次 如果 5,5,1,5则为(短划线5,缺口5,短划线1,缺口5 )循环
			}
        ],
		"color":{r,g,b,a},//rgab对应的值
		"colors":{
            "type":"linear",//线性渐变 |"radial"
            "angle":90.0,//角度
            "colorStops":[
                {
                    "color":{
                        "r":255,
                        "g":255,
                        "b":255,
                        "a":1,//0-1 最终计算 a*opacity
                    },
                    "offset":0.5,//位置 0-1之间
                }
            ]
        },

        // 渲染渐变结构
        "colors":{
            "#FBA500": {
                "id": "87ee9_gradient",
                "color": {
                    "type": "radial",
                    "colorStops": [
                        {
                            "color": {
                                "r": 255,
                                "g": 255,
                                "b": 255,
                                "a": 1
                            },
                            "offset": 0
                        },
                        {
                            "color": {
                                "r": 0,
                                "g": 0,
                                "b": 0,
                                "a": 1
                            },
                            "offset": 1
                        }
                    ],
                    "coords": {
                        "x1": 0,
                        "y1": 0.3420201433256687,
                        "x2": 0.9396926207859084,
                        "y2": 0
                    },
                    "angle": 20
                }
            },
        }

		"picUrl":"图片地址",
		"resId":"seapik_1234"
		"assetWidth/assetHeight":"图片原本的宽高"

		"text":["xxxx"],//文案
		"fontSize":30, //字体大小
		"fontWeight":"normal/bold",
		"lineHeight":13,// 除以10=几倍行距,
		"textAlign": "center",
		"letterSpacing": 0,//字符间距

		"fontFamily":"",//字体

		"dropShadow":{
            blur: 3,
            color: "rgba(255,66,214,1)",
            spread: 0,
            x:0,
            y:0
        }
	},
	"transform": {
        "rotate": 0,//旋转角度
        "zindex": 9,
        "horizontalFlip": false,
        "verticalFlip": false,
        "posX": 68.71,
        "posY": 0.38
    }
}
```
