import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import styles from './index.less'
import { useGetLllegelAssets } from '@/kernel/store';
import { isMaskType } from '@/kernel/utils/assetChecker';
const Lllegal = (props: AssetItemProps) => {
    const lllegelAssets = useGetLllegelAssets();
    const { asset } = props;
    const { attribute } = asset;
    // 资源违规
    const isLllegel = lllegelAssets.filter((item) => {
        if (isMaskType(asset) && asset.assets.length > 0) {
            return (item.resId === attribute.resId || asset.assets[0].attribute.resId === item.resId) && item.scan_flag === 3
        } else {
            return item.resId === attribute.resId && item.scan_flag === 3
        }
    })
    const BackgroundSrc = isLllegel.length > 0 ? 'https://js.xiudodo.com/xiudodo-editor/image/error/lllegelIcon.png'
        : 'https://js.xiudodo.com/xiudodo-editor/image/error/sourceLoss.png'

    return (
        <>
            <div className={styles.lllegal}
                style={{
                    background: `url(${BackgroundSrc})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'auto 100%',
                    backgroundPositionX: '50%'
                }}
            >
            </div>

        </>
    )
}
export default observer(Lllegal);