import { Select } from 'antd';
import classnames from 'classnames';
import { getFontFamily } from '@/utils/fontHandler';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import { cdnHost } from '@/config/urls';
import ShowFont from '@/pages/SidePanel/Brand/BrandModal/BrandDetail/BrandFont/UploadFont/ShowFont';
import { zh, en } from '@/pages/TopToolBar/FontFamily/textList';
import styles from './index.less';

const { Option } = Select;

function FontSet(props: {
  data: any;
  type: string;
  updateFontDetail: () => void;
  fontList: any[];
  defaultFontSize: number;
}) {
  const { bindFontSet } = useBrand();

  const { type, data, updateFontDetail, fontList, defaultFontSize } = props;
  const { font_size = defaultFontSize } = data;
  const sizeArr = () => {
    const arr = [];
    for (let index = 0; index < 69; index++) {
      const element = 8 + 2 * index;
      arr.push(element);
    }
    return arr;
  };

  // setFamily(`webfont-${fontStyle}`);

  const clickUploadFont = (item: any) => {
    bindFontSet(type, 1, item.file_id, font_size, () => {
      updateFontDetail();
    });
  };

  const bindFontSize = (item: any) => {
    bindFontSet(type, data.source_type, data.fontInfo?.font_id, item, () => {
      updateFontDetail();
    });
  };

  const bindFontStyle = (item: any) => {
    bindFontSet(type, 2, item, font_size, () => {
      updateFontDetail();
    });
  };

  const showFont = () => {
    switch (data.source_type) {
      case 1:
        return <img src={data.fontInfo?.cover_path} alt="" height={22} />;
      case 2:
        return (
          <img
            src={`${cdnHost}/index_img/fonts/${getFontFamily(
              data.fontInfo?.font_id,
            )}.svg`}
            alt=""
            height={22}
          />
        );
    }
  };
  return (
    <div className={styles.fontSet}>
      <div className={styles.fontSetInput}>
        {data.fontInfo ? showFont() : <div>选择字体</div>}
      </div>
      <Select
        style={{ width: 195 }}
        placement="topLeft"
        dropdownClassName={styles.fontSetType}
        value=""
      >
        <>
          {fontList?.length > 0 && (
            <div>
              <div>上传字体</div>
              {fontList.map(item => {
                return (
                  <div
                    key={item.id}
                    className={classnames({
                      [styles['font-family-item']]: true,
                      [styles['font-family-active']]:
                        item.file_id === data.fontInfo?.font_id,
                    })}
                    onClick={() => clickUploadFont(item)}
                  >
                    <ShowFont item={item} />
                  </div>
                );
              })}
            </div>
          )}
          {[...zh, ...en].map(group => {
            return (
              <Option
                key={`fontFamily-${group.cateName}`}
                value={`fontFamily-${group.cateName}`}
              >
                <div key={`fontFamily-${group.cateName}`}>
                  <div>{group.cateName}</div>
                  <div>
                    {group.fontList.map((font, index) => {
                      const fontFamilyItem = getFontFamily(font);
                      const fontImgUrl = `${cdnHost}/index_img/fonts/${fontFamilyItem}.svg`;
                      return (
                        <div
                          key={`fontFamily-${font}-${index}`}
                          className={classnames({
                            [styles['font-family-item']]: true,
                            [styles['font-family-active']]:
                              font === data.fontInfo?.font_id,
                          })}
                          onClick={() => {
                            bindFontStyle(font);
                          }}
                        >
                          <img src={fontImgUrl} alt={font} height={22} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Option>
            );
          })}
        </>
      </Select>
      <Select
        value={font_size}
        style={{ width: 70 }}
        placement="topLeft"
        onChange={val => {
          bindFontSize(val);
        }}
      >
        {sizeArr().map(item => {
          return (
            <Option key={item} value={item}>
              {item}
            </Option>
          );
        })}
      </Select>
    </div>
  );
}

export default FontSet;
