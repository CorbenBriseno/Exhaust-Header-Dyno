import React from 'react';
import { HeaderConfig } from '../models/headerModel';

type Props = {
  engines: Record<string, any>;
  engineKey: string;
  onEngineChange: (k: string) => void;
  rpmTarget: number;
  setRpmTarget: (r: number) => void;
  header: HeaderConfig;
  setHeader: (h: HeaderConfig) => void;
};

export default function ControlsPanel({ engines, engineKey, onEngineChange, rpmTarget, setRpmTarget, header, setHeader }: Props) {
  return (
    <div>
      <h3>Controls</h3>

      <div className="control-row">
        <label className="small">Engine</label>
        <select value={engineKey} onChange={e => onEngineChange(e.target.value)}>
          {Object.entries(engines).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>
      </div>

      <div className="control-row">
        <label className="small">RPM Target</label>
        <input type="number" value={rpmTarget} onChange={e => setRpmTarget(Number(e.target.value))} />
      </div>

      <h4>Header</h4>
      <div className="control-row">
        <label className="small">Diameter (inches)</label>
        <input type="number" step="0.01" value={header.diameterIn} onChange={e => setHeader({ ...header, diameterIn: Number(e.target.value) })} />
      </div>
      <div className="control-row">
        <label className="small">Length (inches)</label>
        <input type="number" step="0.1" value={header.lengthIn} onChange={e => setHeader({ ...header, lengthIn: Number(e.target.value) })} />
      </div>
      <div className="control-row">
        <label className="small">Roughness (m)</label>
        <input type="number" step="0.00001" value={header.roughness} onChange={e => setHeader({ ...header, roughness: Number(e.target.value) })} />
      </div>
    </div>
  );
}
