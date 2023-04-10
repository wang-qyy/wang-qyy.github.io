import { useState, useEffect } from 'react';
import { useSetState, useRequest, useLocalStorageState } from 'ahooks';
import { LoadingOutlined } from '@ant-design/icons';
import { Upload, Button, message, Spin } from 'antd';
import classnames from 'classnames';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useUserFontFamilyByObserver, observer } from '@hc/editor-core';
import LazyLoadComponent from '@/components/LazyLoadComponent';

import { debounce, differenceBy } from 'lodash-es';
import { useUserInfo, getUserId } from '@/store/adapter/useUserInfo';

import PhoneBinding from '@/pages/GlobalMobal/PhoneBinding';
import { getMemoryInfo, getFontList } from '@/api/upload';

import { cdnHost } from '@/config/urls';
import { getFontFamily, updateUserFontFamily } from '@/utils/fontHandler';
import { useCheckLoginStatus } from '@/hooks/loginChecker';

import { zh, en } from '@/pages/TopToolBar/FontFamily/textList';

import FontUpload from './FontUpload';
import ShowFont from './ShowFont';

import './index.less';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import { XiuIcon } from '@/components';

interface fontItem {
  id: string;
  file_id: string;
}

const FontFamilyList = observer(
  ({
    list,
    fontLibrary,
    storeFonts,
  }: {
    list: Array<object>;
    storeFonts: (font: string | fontItem) => void;
    fontLibrary: Array<object>;
  }) => {
    const [load, setLoad] = useState(true);
    const [family, setFamily] = useState('');
    const { value, update: updateUploadFontFamily } =
      useUserFontFamilyByObserver();

    const [fontArr, setFontArr] = useState([...zh, ...en]);

    useEffect(() => {
      const recentlyUsed = {
        cateName: '最近使用',
        fontList: fontLibrary,
      };
      const uploadFont = {
        cateName: '上传字体',
        fontList: list,
      };
      setFontArr([recentlyUsed, ...zh, uploadFont, ...en]);
    }, [fontLibrary, list]);
    const clickFont = async (font: string, fontFamilyItem: string) => {
      clickActionWeblog('update_fontFamily');
      storeFonts(font);
      setLoad(false);
      setFamily(fontFamilyItem);
      const result = await updateUploadFontFamily({
        fontFamily: fontFamilyItem,
        resId: '',
        ufsId: '',
      });
      setLoad(result);
    };
    return (
      <OverlayScrollbarsComponent
        options={{
          className: 'os-theme-dark',
          scrollbars: { autoHide: 'never' },
          overflowBehavior: { y: 'scroll' },
        }}
      >
        <div>
          {fontArr.map((group, i) => (
            <div key={`fontFamily-${group.cateName}`}>
              {group?.fontList?.length > 0 && (
                <div className="uploadFont-family-item-title">
                  {group.cateName}
                </div>
              )}
              <div>
                {group.fontList.map(
                  (font: string | fontItem, index: number) => {
                    if (typeof font === 'string') {
                      const fontFamilyItem = getFontFamily(font);
                      const fontImgUrl = `${cdnHost}/index_img/fonts/${fontFamilyItem}.svg`;
                      return (
                        <div
                          key={`fontFamily-${font}-${index}`}
                          className={classnames({
                            'uploadFont-family-item': true,
                            'uploadFont-family-active':
                              value?.fontFamily === fontFamilyItem,
                          })}
                          onClick={() => {
                            clickFont(font, fontFamilyItem);
                          }}
                        >
                          <img src={fontImgUrl} alt={font} height={22} />
                          <div>
                            {family === fontFamilyItem && !load ? (
                              <Spin
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 20 }}
                                    spin
                                  />
                                }
                              />
                            ) : value?.fontFamily === fontFamilyItem ? (
                              <XiuIcon
                                type="iconduihao"
                                style={{ fontSize: 20 }}
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={font.id}
                        className={classnames('uploadFont-family-item', {
                          'uploadFont-family-active':
                            value?.resId === `f${font.file_id}`,
                        })}
                        onClick={() => {
                          clickActionWeblog('update_fontFamily_user');
                          storeFonts(font);
                          updateUploadFontFamily({
                            resId: `f${font.file_id}`,
                            ufsId: `f${font.id}`,
                            fontFamily: `webfont-${font.file_id}`,
                          });
                        }}
                      >
                        <ShowFont id={font.file_id} />
                        <div>
                          {family === `webfont-${font.file_id}` && !load ? (
                            <Spin
                              indicator={
                                <LoadingOutlined
                                  style={{ fontSize: 20 }}
                                  spin
                                />
                              }
                            />
                          ) : value?.fontFamily ===
                            `webfont-${font.file_id}` ? (
                            <XiuIcon
                              type="iconduihao"
                              style={{ fontSize: 20 }}
                            />
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
              {i + 1 !== fontArr?.length && group?.fontList?.length > 0 && (
                <div className="uploadFont-family-item-line" />
              )}
            </div>
          ))}
        </div>
      </OverlayScrollbarsComponent>
    );
  },
);

const FontFamily = (props: { activeToolMenu: string }) => {
  const { activeToolMenu } = props;
  const [state, setState] = useSetState({
    activeType: 'fontLibrary',
    page: 1,
    pageTotal: 1,
  });
  const { checkLoginStatus } = useCheckLoginStatus();
  const userId = getUserId();
  const [fileList, setFileList] = useState([]);
  const [list, setList] = useState<Array<object>>([]);
  const userInfo = useUserInfo();
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // const [phoneBindingShow, setPhoneBindingShow] = useState(false);
  const [fontLibraryObj, setFontLibrary] = useLocalStorageState(
    'fontLibrary',
    {},
  );

  const fontLibrary = fontLibraryObj[`${userInfo.id}${userInfo.team_id}`] || [];
  const [memoryState, setMemoryState] = useSetState({
    maxMemoryByte: 0,
    useMemoryByte: 0,
  }); // 储存空间
  const { data = {}, run } = useRequest(getMemoryInfo);

  const { maxMemoryByte = 0, useMemoryByte = 0 } = data || {};

  // 获取字体列表数据
  const bindFontList = (prams: { page: number }) => {
    getFontList({
      page: prams.page,
      pageSize: 40,
    }).then(res => {
      if (res.code === 0) {
        let newData: Array<{}> = [];
        if (prams.page > 1) {
          if (res.data.items.length > 0) {
            newData = [...list, ...res.data.items];
          }
        } else {
          newData = [...res.data.items];
        }
        setList(newData);
        setState({
          page: res.data.page,
          pageTotal: res.data.pageTotal,
        });

        // 更新font-face
        updateUserFontFamily(newData);
      }
    });
  };

  useEffect(() => {
    setMemoryState({
      maxMemoryByte,
      useMemoryByte,
    });
  }, [maxMemoryByte, useMemoryByte]);

  // 默认显示字体库
  useEffect(() => {
    if (activeToolMenu) {
      setState({ activeType: 'fontLibrary' });
    }
  }, [activeToolMenu]);

  useEffect(() => {
    if (userId > 0) {
      run();
      bindFontList({ page: 1 });
    }
  }, [userId]);

  const handleFilesChange = debounce((uploadFiles: File[]) => {
    const temp = differenceBy(uploadFiles, fileList, 'uid');
    const { maxMemoryByte } = memoryState;

    let { useMemoryByte } = memoryState;

    const arr = [];
    for (let i = 0; i < temp.length; i++) {
      const item = temp[i];

      useMemoryByte += item.size;
      setMemoryState({ useMemoryByte });

      if (useMemoryByte > maxMemoryByte) {
        // message.config({ maxCount: 1 });
        message.info({ content: '存储空间已满', maxCount: 1 });
        break;
      } else {
        item.state = 0;
        arr.push(item);
      }
    }

    const newArr = fileList.concat(arr);
    setFileList(newArr);
  }, 200);

  // 上传字体状态更新
  const bindUploadFontState = (id: string | number, state: number) => {
    fileList.map((item: { uid: string | number; state: number }) => {
      if (item.uid === id) {
        item.state = state;
        return item;
      }
      return item;
    });
  };

  // 字体成功上传
  const successUpload = () => {
    const newList = fileList.filter(item => {
      return item.uid !== 1;
    });
    setFileList(newList);
  };

  // 文件上传前的一些操作
  function beforeUpload(file: File, uploadFiles: File[]) {
    if (checkLoginStatus()) {
      return;
    }
    if (userInfo?.bind_phone !== 1) {
      showBindPhoneModal();
    } else {
      handleFilesChange(uploadFiles);
    }
    return false; // 手动上传
  }

  const isExistence = (font: any) => {
    let result = false;
    if (typeof font === 'string') {
      if (fontLibrary && fontLibrary.indexOf(font) > -1) {
        return true;
      }
      return false;
    }
    for (let i = 0; i < fontLibrary.length; i++) {
      if (fontLibrary[i]?.id === font?.id) {
        result = true;
        break;
      }
    }
    return result;
  };

  // 存储使用字体
  const storeFonts = (font: string) => {
    if (isExistence(font)) {
      return;
    }
    const newArr = [font, ...fontLibrary]?.filter((_item, index) => {
      return index < 5;
    });
    setFontLibrary({ [`${userInfo.id}${userInfo.team_id}`]: newArr });
  };

  return (
    <div className="uploadFontWarp">
      <div className="uploadFont">
        <div
          className={classnames('uploadFont-item', {
            'language-item-active': state.activeType === 'fontLibrary',
          })}
          onClick={() => setState({ activeType: 'fontLibrary' })}
        >
          字体库
        </div>
        <div
          className={classnames('uploadFont-item', {
            'language-item-active': state.activeType === 'upload',
          })}
          onClick={() => setState({ activeType: 'upload' })}
        >
          上传字体
        </div>
      </div>
      <div className="uploadFont-family-wrap">
        <div className="uploadFont-family-list">
          <LazyLoadComponent visible={state.activeType === 'fontLibrary'}>
            <FontFamilyList
              list={list}
              fontLibrary={fontLibrary}
              storeFonts={storeFonts}
            />
          </LazyLoadComponent>
          {/* <LazyLoadComponent visible={state.activeType === 'upload'}> */}
          {state.activeType === 'upload' && (
            <FontUpload
              fileList={fileList}
              beforeUpload={beforeUpload}
              successUpload={successUpload}
              bindUploadFontState={bindUploadFontState}
              bindFontList={bindFontList}
              list={list}
              state={state}
              storeFonts={storeFonts}
            />
          )}
          {/* </LazyLoadComponent> */}
        </div>
        <Upload
          beforeUpload={beforeUpload}
          multiple
          showUploadList={false}
          accept=".ttf,.otf"
        >
          <Button
            type="primary"
            className="uploadFont-family-button"
            onClick={e => {
              setState({ activeType: 'upload' });
              // if (userInfo?.bind_phone !== 1) {
              //   e.stopPropagation();
              //   setPhoneBindingShow(true);
              // } else {
              //   setState({ activeType: 'upload' });
              // }
            }}
          >
            上传字体
          </Button>
        </Upload>
      </div>
      {/* <PhoneBinding
        phoneBindingShow={phoneBindingShow}
        setPhoneBindingShow={setPhoneBindingShow}
        loginCallback={() => {}}
      /> */}
    </div>
  );
};

export default FontFamily;
