/* eslint-disable no-nested-ternary */
import React from 'react';
import styles from './index.less';

const VipSide = (props: { active: any; tagType: string; interests: any }) => {
  const { active, tagType, interests } = props;
  const { gift_pkg, includes } = interests || {};
  const { cp, vm, aia, kt } = gift_pkg || {};
  const { draft, disk } = includes || {};

  const getTime = () => {
    switch (`${tagType}${active}`) {
      case '30':
        return 3;
      default:
        return 3;
    }
  };

  // 获取小工具权益次数
  const getNum = item => {
    const limited = item?.limited && item?.limited[0];
    if (item?.limited?.length === 0 && item?.value === -1) {
      return ' 无限使用';
    }
    return ` ${limited?.num || 0}次${limited?.unit && limited?.unit === 'month' ? '/月' : '/年'
      }`;
  };
  const map = {
    '1': '个人下载年VIP权益',
    '2': '个人商用年VIP权益',
    '3': '企业商用版',
  };

  return (
    <div className={styles['vip-interest']}>
      <h6>{map[tagType]}</h6>
      <div className={styles['vip-interest-line']} />
      <ul className={styles['current-vip-interest']}>
        <li className={styles['current-vip-interest-title']}>功能+内容权益</li>
        <li>
          站内视频素材+视频模版
          <span>
            {tagType === '1' ? '畅用' : tagType === '2' ? '可商用' : '企业商用'}
          </span>
        </li>
        <li>
          视频合成导出时长 <span>{getTime()}分钟</span>
        </li>
        <li>
          作品存储数量 <span>{draft === -1 ? '无限制' : draft}</span>
        </li>
        <li>编辑器模版高清无水印导出</li>
        <li hidden={tagType !== '3'}>
          视频素材下载 <span>4k/8k特权</span>
        </li>
        <li>
          会员专属素材
          <span>
            {tagType === '1'
              ? '无水印导出'
              : tagType === '2'
                ? '可商用'
                : '企业商用'}
          </span>
        </li>
        <li>专属客服/正规发票</li>
        <li hidden={tagType !== '3'}>可提供授权证书</li>
        <li className={styles['current-vip-interest-title']}>工具权益</li>
        <li>
          AI语音小工具
          <span>{getNum(aia)}</span>
        </li>
        <li>
          抠图工具套餐
          <span>{getNum(kt)}</span>
        </li>
        <li>
          视频压缩工具
          <span>{getNum(cp)}</span>
        </li>
        <li>
          视频水印工具
          <span>{getNum(vm)}</span>
        </li>
        <li>
          云端存储空间 <span>{disk}</span>
        </li>
        <li>视频剪辑工具畅用 </li>
      </ul>
    </div>
  );
};

export default VipSide;
