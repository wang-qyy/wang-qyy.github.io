import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { getAssetInnerDragViewScale } from '@/kernel/store/assetHandler/utils';
import styles from './index.less';
import classNames from 'classnames';
const DragView = (props: AssetItemProps) => {
    const {
        asset,
        canvasInfo,
        isPreviewMovie = false,
    } = props;
    if (isPreviewMovie) {
        return null;
    }
    const { assetPosition, tempData } = asset;
    const dragSize = getAssetInnerDragViewScale(asset);
    return (
        <>
            {tempData?.rt_hover?.isHover && <div
                className={styles.dragView}
                style={{
                    transform: `scale(${1 / canvasInfo.scale})`, position: 'absolute',
                    left: (dragSize?.left / canvasInfo.scale - assetPosition.left),
                    top: (dragSize?.top / canvasInfo.scale - assetPosition.top),
                }}>
                <div
                    className={classNames(styles.dragViewWrap,
                        {
                            [styles.dragViewWrapCenter]: tempData?.rt_hover?.isMaskCenter
                        }
                    )}
                    style={{
                        width: dragSize?.width,
                        height: dragSize?.height,
                    }} >
                    <div className={styles.dragIconWrap}>
                        <img className={styles.dragIcon} src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNTVweCIgaGVpZ2h0PSI1NXB4IiB2aWV3Qm94PSIwIDAgNTUgNTUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+57yW57uEPC90aXRsZT4KICAgIDxkZWZzPgogICAgICAgIDxmaWx0ZXIgaWQ9ImZpbHRlci0xIj4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUdyYXBoaWMiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDEuMDAwMDAwIDAgMCAwIDAgMS4wMDAwMDAgMCAwIDAgMCAxLjAwMDAwMCAwIDAgMCAxLjAwMDAwMCAwIj48L2ZlQ29sb3JNYXRyaXg+CiAgICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0i6JKZ54mI5ouW5ou95LyY5YyWIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0i5Lqk5LqS6K+05piOIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNTIuMDAwMDAwLCAtMjQ0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0i57yW57uEIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NC4wMDAwMDAsIDI0Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxwb2x5bGluZSBpZD0i6Lev5b6EIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBwb2ludHM9IjUxIDM1LjMyMjE4MjYgNTEgNTEgMCA1MSAwIDAgMzguMTQ5ODAyNiAwIj48L3BvbHlsaW5lPgogICAgICAgICAgICAgICAgPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlci0xKSIgaWQ9Iui/lOWbniI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjcuNTAwMDAwLCAyNS45ODkwODYpIHNjYWxlKDEsIC0xKSB0cmFuc2xhdGUoLTI3LjUwMDAwMCwgLTI1Ljk4OTA4NikgdHJhbnNsYXRlKDcuMDAwMDAwLCAxMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTQwLjQxMDAyOSwzMS45NzgxNzE1IEMzNy45MzE4Mzk4LDI0LjQyMzM3MzEgMzAuNzUzMzIxNCwxOS4wMjY0Mzk1IDIyLjI4NTQxMzEsMTguODcxOTgxOCBDMjEuMjI5MjEwNywxOC44NTM4MTAzIDIwLjIzMjQ0ODMsMTguODc2NTI0NyAxOS4yODU5ODEyLDE4Ljk0MDEyNDkgTDE5LjI4NTk4MTIsMjYuNDA0MDY1OSBDMTkuMjkwNTUzNSwyNi40MjY3ODAyIDE5LjI5NTEyNTgsMjYuNDQ5NDk0NiAxOS4yOTUxMjU4LDI2LjQ3MjIwOSBDMTkuMjk1MTI1OCwyNi42NTM5MjM5IDE5LjE0NDIzOTgsMjYuODAzODM4NyAxOC45NjEzNDc2LDI2LjgwMzgzODcgQzE4LjgzNzg5NTQsMjYuODAzODM4NyAxOC43MzI3MzI0LDI2Ljc0MDIzODUgMTguNjc3ODY0NywyNi42NDQ4MzgyIEwxOC42Nzc4NjQ3LDI2LjY3NjYzODMgTDAuMjM3NzU5ODQ1LDEzLjg3MDI3ODMgTDAuMzMzNzc4MjQzLDEzLjg3MDI3ODMgQzAuMTUwODg2MDU1LDEzLjg3MDI3ODMgMCwxMy43MjAzNjM0IDAsMTMuNTM4NjQ4NSBDMCwxMy40MDY5MDUyIDAuMDc3NzI5MTc5OSwxMy4yOTMzMzMzIDAuMTg3NDY0NDkzLDEzLjIzODgxODkgTDE4LjY3MzI5MjQsMC40MDUyMDE1OSBMMTguNjczMjkyNCwwLjQzNzAwMTcwNCBDMTguNzMyNzMyNCwwLjM0MTYwMTM2MyAxOC44Mzc4OTU0LDAuMjc4MDAxMTM2IDE4Ljk1Njc3NTMsMC4yNzgwMDExMzYgQzE5LjEzOTY2NzUsMC4yNzgwMDExMzYgMTkuMjkwNTUzNSwwLjQyNzkxNTk1NyAxOS4yOTA1NTM1LDAuNjA5NjMwODkyIEMxOS4yOTA1NTM1LDAuNjMyMzQ1MjU4IDE5LjI4NTk4MTIsMC42NTUwNTk2MjUgMTkuMjgxNDA4OSwwLjY3Nzc3Mzk5MiBMMTkuMjgxNDA4OSw3LjkxOTExNDE0IEMyMC4xMjcyODUzLDcuODc4MjI4MjggMjEuMDE0MzEyNCw3Ljg2NDU5OTY2IDIxLjk0NzA2MjYsNy44ODI3NzExNSBDMzIuNDY3OTM1Nyw4LjA1OTk0MzIxIDQwLjk5OTkyOTMsMTYuODI3Njg4OCA0MC45OTk5MjkzLDI3LjI4NTM4MzMgQzQxLjAwNDQyODYsMjguODk4MTAzNCA0MC43OTQxMDI2LDMwLjQ3NDQ4MDQgNDAuNDEwMDI5LDMxLjk3ODE3MTUgWiBNMTkuMzIzOTc1MSw4LjUyNzkwMDYxZS0xNSBMMTkuMzIzOTc1MSwwLjAyIEwxOS4yODM5NzUxLDAuMDIgTDE5LjMyMzk3NTEsOC41Mjc5MDA2MWUtMTUgWiBNMTkuMzIxMjYxMywyNy4xMjczMjU0IEwxOS4yOTEyNjEzLDI3LjEwNzMyNTQgTDE5LjMyMTI2MTMsMjcuMTA3MzI1NCBMMTkuMzIxMjYxMywyNy4xMjczMjU0IFoiIGlkPSLlvaLnirYiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+' />
                    </div>
                    {dragSize?.width > 60 && <span className={styles.text}>{tempData?.rt_hover?.isMaskCenter ? '释放' : '拖入'}</span>}
                </div>
            </div>
            }
        </>
    )
}
export default observer(DragView);