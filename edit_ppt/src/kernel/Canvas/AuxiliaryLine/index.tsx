import React from 'react';
import { observer } from 'mobx-react';
import { AuxiliaryLineStyle } from './hooks';

function AuxiliaryLine({ styles }: { styles: AuxiliaryLineStyle }) {
  return (
    <div className="hc-asset-auxiliary-line">
      <div
        style={styles?.vertical?.start}
        className="hc-auxiliary-line-item hc-auxiliary-line-left"
      />
      <div
        style={styles?.vertical?.center}
        className="hc-auxiliary-line-item hc-auxiliary-line-leftCenter"
      />
      <div
        style={styles?.vertical?.end}
        className="hc-auxiliary-line-item hc-auxiliary-line-right"
      />

      <div
        style={styles?.horizontal?.start}
        className="hc-auxiliary-line-item hc-auxiliary-line-top"
      />
      <div
        style={styles?.horizontal?.center}
        className="hc-auxiliary-line-item hc-auxiliary-line-topCenter"
      />
      <div
        style={styles?.horizontal?.end}
        className="hc-auxiliary-line-item hc-auxiliary-line-bottom"
      />
    </div>
  );
}

export default observer(AuxiliaryLine);
