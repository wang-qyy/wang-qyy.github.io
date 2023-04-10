import XiuIcon from '@/components/XiuIcon';

export default function Empty() {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <span
        style={{
          fontSize: 12,
          border: '1px dashed #eeeff2',
          color: '#7e8aa9',
          padding: '4px 10px',
        }}
      >
        <XiuIcon type="iconweikong" />
        暂无内容可替换修改
      </span>
    </div>
  );
}
