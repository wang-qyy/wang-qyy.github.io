import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { PlusOutlined,LoadingOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import { useUserFontFamilyByObserver, observer } from '@hc/editor-core';
import classnames from 'classnames';

import UploadFontItem from './UploadFontItem';
import styles from './index.less';
import { useState } from 'react';
import { XiuIcon } from '@/components';

function FontUpload(props: any) {
  const {
    fileList,
    beforeUpload,
    successUpload,
    bindUploadFontState,
    list,
    bindFontList,
    state,
    storeFonts,
  } = props;
  const [load, setLoad] = useState(true);
  const [family, setFamily] = useState('');
  const { value, update: updateFontFamily } = useUserFontFamilyByObserver();

  // 字体成功上传，删除上传列表当前数据，刷新字体列表数据
  const bindSuccessUpload = (id: number) => {
    successUpload(id);
    bindFontList({ page: 1 });
  };
  const clickFont = async (item: any) => {
    setLoad(false);
    setFamily(`webfont-${item.file_id}`);
    storeFonts(item);
    let result = await updateFontFamily({
      resId: `f${item.file_id}`,
      ufsId: `f${item.id}`,
      // fontFamily: item.fileInfo.values.family,
      fontFamily: `webfont-${item.file_id}`,
    });
    setLoad(result);
  }
  return (
    <OverlayScrollbarsComponent
      options={{
        className: 'os-theme-dark',
        scrollbars: { autoHide: 'never' },
        overflowBehavior: { y: 'scroll' },
        callbacks: {
          onScroll: (params: any) => {
            const { scrollTop, scrollHeight, clientHeight } = params.path[0];
            if (
              Math.round(scrollTop) + clientHeight >= scrollHeight &&
              state.page < state.pageTotal
            ) {
              bindFontList({ page: state.page + 1 });
            }
          },
        },
      }}
    >
      {fileList?.length + list?.length > 0 ? (
        <>
          {fileList?.map((item: any) => {
            if (item.state !== 1) {
              return (
                <UploadFontItem
                  key={item.uid}
                  data={item}
                  successUpload={bindSuccessUpload}
                  bindUploadFontState={bindUploadFontState}
                />
              );
            }
            return <></>;
          })}
          {list?.map((item: any) => {
            return (
              <div
                key={item.id}
                className={classnames(styles.fontItem, {
                  [styles.fontItemActive]: value?.resId === `f${item.file_id}`,
                })}
                onClick={() => {
                  clickFont(item);
                }}
              >
                <img
                  height={22}
                  className={styles.fontItemName}
                  src={item?.fileInfo?.cover_path}
                  alt=""
                />
                <div>
                  {(family === `webfont-${item.file_id}` && !load) ?
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} /> :
                    value?.fontFamily === `webfont-${item.file_id}` ? <XiuIcon type='iconduihao' style={{ fontSize: 20 }} /> : <></>
                  }

                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className={styles.uploadFontwarp}>
          <div className={styles.uploadFont}>
            <Upload.Dragger
              multiple
              openFileDialogOnClick
              showUploadList={false}
              beforeUpload={beforeUpload}
              style={{ height: '100%', cursor: 'auto' }}
              onDrop={() => { }}
              accept=".ttf,.otf"
            >
              <div className={styles.uploadFontIcon}>
                <PlusOutlined style={{ fontSize: 24 }} />
              </div>
              <div className={styles.uploadFontTxt}>
                您当前还未上传字体
                <br /> 点击上传或拖拽字体上传
              </div>
            </Upload.Dragger>
          </div>
        </div>
      )}
    </OverlayScrollbarsComponent>
  );
}

export default observer(FontUpload);
