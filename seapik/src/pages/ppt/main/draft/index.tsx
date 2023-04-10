import { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Button, Modal } from 'antd';
import { Editor, EditorState, ContentState } from 'draft-js';
import { useDraftModal, changeDraftData } from '@/pages/store/global';

import { stopPropagation } from '@/utils';
import { textToPPT, formatTextForAsset } from '@/utils/draftHandler';

import pattern from './pattern';

import 'draft-js/dist/Draft.css';
import './index.less';

function DraftInput() {
  const { open, openFn } = useDraftModal();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [currentText, _currentText] = useState('');

  const editor = useRef(null);

  function focusEditor() {
    editor.current?.focus();
  }

  useEffect(() => {
    focusEditor();
  }, []);

  const styleMap = {
    CODE: {
      lineHeight: 1.3,
      backgroundColor: 'pink',
    },
  };

  function updateEditorState(editorState: EditorState) {
    setEditorState(editorState);
    // const inputText = formatTextForAsset(editorState);
    // // console.log(inputText, '======', editorState);

    // changeDraftData(inputText);
  }

  useEffect(() => {
    const editorText = EditorState.createWithContent(
      ContentState.createFromText(currentText),
    );
    setEditorState(editorText);
  }, [currentText]);

  return (
    <Modal
      open={open}
      okText="文本转PPT"
      cancelText="关闭"
      width={800}
      onCancel={() => openFn(false)}
      maskClosable={false}
      onOk={(e) => {
        const inputText = formatTextForAsset(editorState);
        changeDraftData(inputText);
        textToPPT();
        openFn(false);
      }}
    >
      <div className="modules">
        <span>模板：</span>
        {pattern.map((item) => (
          <Button
            key={item.key}
            style={{ margin: '0 8px' }}
            onClick={() => {
              _currentText(currentText + '\n' + item.text);
            }}
          >
            {item.name}
          </Button>
        ))}
      </div>
      <div
        className={classNames('draft-editor-wrap', { 'editor-active': true })}
        onKeyDown={stopPropagation}
      >
        <Editor
          ref={editor}
          customStyleMap={styleMap}
          editorState={editorState}
          onChange={updateEditorState}
          placeholder="你可以再这里整理思路，书写大纲"
        />
      </div>
    </Modal>
  );
}

export default observer(DraftInput);
