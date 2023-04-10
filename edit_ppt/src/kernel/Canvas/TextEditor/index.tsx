import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  CSSProperties,
} from 'react';
import { Editor, EditorState } from 'draft-js';
import { observer } from 'mobx-react';
import { AssetBaseSize, AssetClass } from '@kernel/typing';
import {
  getTextEditAsset,
  assetUpdater,
  getCanvasInfo,
  deleteAssetInTemplate,
  useAniPathEffect,
} from '@kernel/store';
import { stopPropagation } from '@kernel/utils/single';
import {
  formatTextForAsset,
  formatTextForEditor,
  getFontStyle,
} from '@kernel/utils/assetHelper/font';
import { reportChange } from '@/kernel/utils/config';
import { buildAttribute } from '@/kernel/store/assetHandler/utils';
import { createFromText, calcTextBoxMaxText } from './utils';
import CaluFontSize from './caluFontSize';

interface TextEditorProps {
  text: EditorState;
  setText: (text: EditorState) => void;
}

const TextEditor = forwardRef(
  ({ text: editorState, setText: setEditorState }: TextEditorProps, ref) => {
    const EditorRef = useRef<Editor>(null);

    function selectAllText() {
      const selectionToEndState = EditorState.moveSelectionToEnd(editorState);
      const newSelectionState = selectionToEndState.getSelection();
      const selectionState = editorState.getSelection();

      const focusKey = newSelectionState.getStartKey();
      const focusOffset = newSelectionState.getStartOffset();
      const anchorKey = selectionState.getAnchorKey();
      const anchorOffset = selectionState.getAnchorOffset();

      const updatedSelection = newSelectionState.merge({
        focusKey,
        focusOffset,
        anchorKey,
        anchorOffset,
      });

      setEditorState(
        EditorState.forceSelection(selectionToEndState, updatedSelection),
      );
    }

    function getEditorSize() {
      if (EditorRef.current) {
        return {
          height: EditorRef.current.editorContainer?.offsetHeight || 0,
          width: EditorRef.current.editorContainer?.offsetWidth || 0,
        };
      }
      return -1;
    }

    useImperativeHandle(
      ref,
      () => ({
        getEditorSize,
      }),
      [],
    );
    useLayoutEffect(() => {
      EditorRef?.current?.focus();
      selectAllText();
    }, []);
    const styleMap = {
      CODE: {
        lineHeight: 1.3,
      },
    };
    return (
      <Editor
        ref={EditorRef}
        customStyleMap={styleMap}
        editorState={editorState}
        onChange={setEditorState}
        stripPastedStyles
      />
    );
  },
);

function TextEditorWrapper() {
  const { inAniPath, changStatue } = useAniPathEffect();
  const textEditAsset = getTextEditAsset();
  const container = useRef(null);
  const { scale } = getCanvasInfo();
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [assetCache, setAssetCache] = useState<AssetClass | undefined>();

  const EditorRef = useRef<{ getEditorSize: () => AssetBaseSize }>(null);

  const [currentText, setCurrentText] = useState('');
  const [changeText, setChangeText] = useState('');
  const maxInputNum = useRef<number>(calcTextBoxMaxText(textEditAsset) || 0);
  // 修改字体大小
  function changeFontSize(fontSize: number) {
    assetUpdater(textEditAsset, {
      attribute: {
        fontSize,
      },
    });
    textEditAsset?.setRtRelativeByParent();
  }
  function focusUpdateSize() {
    if (EditorRef.current && assetCache) {
      const { attribute, fontSizeScale } = assetCache;
      let { width, height } = EditorRef.current.getEditorSize();
      height *= fontSizeScale;
      width *= fontSizeScale;

      // 向上取整
      height = Math.ceil(height);
      if (attribute.writingMode === 'vertical-rl') {
        if (width !== attribute.width) {
          assetUpdater(
            assetCache,
            buildAttribute({
              width,
            }),
          );
          if (assetCache?.attribute?.stayEffect?.graph) {
            const bounds = assetCache?.attribute?.stayEffect?.graph.toBounds[0];
            bounds.width = width;
            assetUpdater(
              assetCache,
              buildAttribute({
                stayEffect: {
                  ...assetCache?.attribute?.stayEffect,
                  graph: {
                    ...assetCache?.attribute?.stayEffect?.graph,
                    toBounds: [bounds],
                  },
                },
              }),
            );
          }
        }
      } else {
        if (height !== attribute.height) {
          assetUpdater(
            assetCache,
            buildAttribute({
              height,
            }),
          );
          if (assetCache?.attribute?.stayEffect?.graph) {
            const bounds = assetCache?.attribute?.stayEffect?.graph.toBounds[0];
            bounds.height = height;
            assetUpdater(
              assetCache,
              buildAttribute({
                stayEffect: {
                  ...assetCache?.attribute?.stayEffect,
                  graph: {
                    ...assetCache?.attribute?.stayEffect?.graph,
                    toBounds: [bounds],
                  },
                },
              }),
            );
          }
        }
      }
    }
  }
  function updateEditorState(editorState: EditorState) {
    if (!textEditAsset) {
      return;
    }
    setEditorState(editorState);
    const text = formatTextForAsset(editorState);
    const strText = typeof text !== 'string' ? text?.join('') : text;

    // 改变的文字
    const strTextHtml = typeof text !== 'string' ? text?.join('<br/>') : text;
    if (textEditAsset?.parent) {
      if (strText.length < maxInputNum.current && currentText !== strTextHtml) {
        setTimeout(() => {
          setCurrentText(strTextHtml);
          setChangeText(strTextHtml);
        });
      }
    } else {
      setTimeout(() => {
        focusUpdateSize();
      });
    }
  }
  useEffect(() => {
    if (textEditAsset) {
      setAssetCache(textEditAsset);
      const text = formatTextForEditor(textEditAsset.attribute.text) || '';
      setEditorState(createFromText(text));
      // 改变的文字
      const strTextHtml =
        typeof text !== 'string' ? (text as string[])?.join('<br/>') : text;
      if (!currentText || strTextHtml !== currentText) {
        setCurrentText(strTextHtml);
      }
    } else {
      if (editorState && assetCache) {
        const text = formatTextForAsset(editorState);
        if (text.toString() !== '') {
          assetUpdater(assetCache, {
            attribute: {
              text,
            },
          });
        } else {
          deleteAssetInTemplate(assetCache.meta.id);
        }
        reportChange('updateText', true);
        setEditorState(null);
        setAssetCache(undefined);
      }
    }
    maxInputNum.current = calcTextBoxMaxText(textEditAsset);
    // 针对气泡字，卸载的时候，重现计算ralative信息
    if (textEditAsset?.parent) {
      return () => {
        textEditAsset.setRtRelativeByParent();
        setChangeText('');
      };
    }
    // 编辑文字时候，清空路径动画编辑
    if (inAniPath) {
      changStatue(-1);
    }
  }, [textEditAsset]);

  useLayoutEffect(() => {
    if (textEditAsset && !textEditAsset?.parent) {
      focusUpdateSize();
    }
  }, [
    textEditAsset?.attribute.writingMode,
    textEditAsset?.attribute.fontFamily,
    textEditAsset?.attribute.lineHeight,
    textEditAsset?.attribute.letterSpacing,
    textEditAsset?.attribute.fontSize,
  ]);

  const fontStyle = getFontStyle(textEditAsset);
  const fontScaleStyle: () => CSSProperties = () => {
    if (textEditAsset) {
      const { fontSizeScale, containerSize } = textEditAsset;
      const { width, height } = containerSize;
      return {
        width: width / fontSizeScale,
        height: height / fontSizeScale,
        transform: `scale(${fontSizeScale})`,
        transformOrigin: '0 0',
        left: 0,
        top: 0,
        position: 'absolute',
      };
    }
    return {};
  };
  const rotateDom = () => {
    if (textEditAsset) {
      const { assetAbsolutePositionScale } = textEditAsset;
      return {
        transform: `rotate(${assetAbsolutePositionScale?.rotate || 0}deg)`,
        width: '100%',
        height: '100%',
      };
    }
  };
  const moduleStyle = useMemo(() => {
    if (textEditAsset?.parent) {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: textEditAsset?.attribute?.textAlign,
      };
    }
  }, [textEditAsset?.parent, textEditAsset?.attribute?.textAlign]);
  const editorStyle = useMemo(() => {
    if (textEditAsset) {
      const { assetAbsolutePositionScale, containerSize } = textEditAsset;
      return {
        ...assetAbsolutePositionScale,
        ...containerSize,
        transformOrigin: '0 0 0',
        transform: `scale(${scale})`,
        position: 'absolute',
      };
    }
    return {};
  }, [textEditAsset?.containerSize, textEditAsset?.assetAbsolutePositionScale]);
  return (
    <>
      <div
        className="hc-asset-text-editor"
        style={editorStyle}
        onMouseDown={stopPropagation}
        onClick={stopPropagation}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        onKeyPress={stopPropagation}
        onPaste={stopPropagation}
      >
        <div style={rotateDom()}>
          <div style={fontScaleStyle()}>
            <div
              style={{
                zIndex: undefined,
                ...fontStyle,
                ...moduleStyle,
                width: '100%',
                height: '100%',
              }}
              ref={container}
            >
              {editorState && (
                <TextEditor
                  ref={EditorRef}
                  setText={updateEditorState}
                  text={editorState}
                />
              )}
            </div>
          </div>
          {textEditAsset && changeText && textEditAsset?.parent && (
            <CaluFontSize
              key={currentText}
              textEditAsset={textEditAsset}
              currentText={currentText}
              onChange={changeFontSize}
            />
          )}
        </div>
      </div>

      {/* {textEditAsset && !textEditAsset?.parent && currentEditText.length > 0 && (
        <TextContainer asset={textEditAsset} text={currentEditText} />
      )} */}
    </>
  );
}

export default observer(TextEditorWrapper);
