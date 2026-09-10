import React, { useState, useMemo } from 'react';
import ControlsPanel from './components/ControlsPanel';
import ChartPanel from './components/ChartPanel';
import ThreeFlowView from './components/ThreeFlowView';
import engines from './presets/engines.json';
import { computeSweep } from './models/engineModel';
import { HeaderConfig } from './models/headerModel';

export default function App() {
  const [engineKey, setEngineKey] = useState(Object.keys(engines)[0]);
  const [rpmTarget, setRpmTarget] = useState(4000);
  const [header, setHeader] = useState<HeaderConfig>({ diameterIn: 1.5, lengthIn: 24, roughness: 0.0001 });

  const engine = engines[engineKey];

  const rpmArray = useMemo(() => {
    const arr = [];
    for (let r = 1000; r <= Math.max(engine.redline || 7000, rpmTarget); r += 100) arr.push(r);
    return arr;
  }, [engine, rpmTarget]);

  const sweep = useMemo(() => computeSweep(engine, header, rpmArray), [engine, header, rpmArray]);

  return (
    <div className="app">
      <div className="left">
        <ControlsPanel
          engines={engines}
          engineKey={engineKey}
          onEngineChange={setEngineKey}
          rpmTarget={rpmTarget}
          setRpmTarget={setRpmTarget}
          header={header}
          setHeader={setHeader}
        />
      </div>

      <div className="center">
        <div className="chart-container">
          <ChartPanel sweep={sweep} rpmTarget={rpmTarget} />
        </div>
        <div style={{ flex: 1 }}>
          <ThreeFlowView header={header} rpm={rpmTarget} exhaustVelocity={sweep.find(s => s.rpm === rpmTarget)?.exhaustVelocity || 0} />
        </div>
      </div>

      <div className="right">
        <h3>Engine Info</h3>
        <div className="small">Name: {engine.name}</div>
        <div className="small">Displacement: {engine.displacementL} L</div>
        <div className="small">Cylinders: {engine.cylinders}</div>
        <div className="small">Redline: {engine.redline}</div>
      </div>
    </div>
  );
}
