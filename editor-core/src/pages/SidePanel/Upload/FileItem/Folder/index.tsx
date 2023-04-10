import { ossEditorPath, ossPath } from '@/config/urls';
import './index.less';

export default function Folder(props: any) {
  // console.log('Folder', props)
  return (
    <div className="upload-file-folder">
      {props.thumbnail.map(
        (item, index) =>
          index < 2 && (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * 8,
                width: 134,
                height: '100%',
                background: `url(${
                  item ?? ossPath('/image/fileManage/fileCover.png')
                }) center ${10 + 5 * index}px / ${80 + index * 10}% no-repeat`,
              }}
            />
          ),
      )}

      <img
        src={ossEditorPath('/image/folder.png')}
        alt=""
        style={{
          width: 'calc(100% + 8px)',
          position: 'absolute',
          bottom: 0,
          left: -4,
        }}
      />
    </div>
  );
}
