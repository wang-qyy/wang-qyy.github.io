import { useGetCurrentAsset, observer } from '@hc/editor-core';
import { getInitFontAttribute } from '@/utils/assetHandler/assetUtils';
import { handleAddAsset } from '@/utils/assetHandler';

import Mold from '../../components/Mold';
import TextItem from '../Item';

import EffectColorList from '../EffectColor/list';

function TextList() {
  const currentAsset = useGetCurrentAsset();
  const attribute = currentAsset?.attribute;

  function handleItemClick(type: string, id?: string) {
    if (type === 'effect') {
      handleAddAsset({
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          ...getInitFontAttribute('effect'),
          rt_preview_url: data.preview_url,
          effectColorful: {
            resId: id,
            effect: '',
          },
        },
      });
    } else {
      if (type !== 'text' && id) {
        attribute.effect = `${id}@0`;
      }

      handleAddAsset({
        meta: {
          type: 'text',
          addOrigin: type === 'text' ? 'text' : 'specificWord',
        },
        attribute: {
          ...attribute,
          ...getInitFontAttribute(type),
        },
      });
    }
  }
  return (
    <div style={{ height: '100%', paddingLeft: 18, overflowY: 'auto' }}>
      <Mold title="基础文字">
        <TextItem
          type="title"
          name={
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
              标题
            </div>
          }
          onClick={() => handleItemClick('title')}
          attribute={{}}
        />
        <TextItem
          type="text"
          name={<div style={{ fontSize: 14, color: '#fff' }}>文本</div>}
          onClick={() => handleItemClick('text')}
          attribute={{}}
        />

        <TextItem
          type="textBackground"
          style={{ width: 148 }}
          name={
            <div
              style={{
                fontSize: 14,
                color: '#fff',
                width: '120px',
                height: '26px',
                backgroundColor: '#1C1C26',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              带背景文字
            </div>
          }
          onClick={() => handleItemClick('textBackground')}
          attribute={{}}
        />
      </Mold>
      <Mold
        title="特效字"
        contentStyle={{
          gridTemplateColumns: `repeat(auto-fill,minmax(88px,1fr))`,
          paddingRight: 4,
        }}
      >
        <EffectColorList onHandleClick={handleItemClick} type="add" />
      </Mold>
    </div>
  );
}
export default observer(TextList);
