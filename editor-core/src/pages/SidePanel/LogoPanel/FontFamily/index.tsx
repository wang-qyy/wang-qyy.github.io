import {
  useUpdateLogoTextFontFamilyByObserver,
  observer,
} from '@hc/editor-core';

import { SelectedFontFamily } from '@/pages/TopToolBar/FontFamily';

import './index.less';

function FontFamily() {
  const [value, update] = useUpdateLogoTextFontFamilyByObserver();

  return (
    <div className="logo-font-family">
      <SelectedFontFamily
        fontFamily={value}
        onChange={font => {
          update(font);
        }}
      />
    </div>
  );
}

export default observer(FontFamily);
