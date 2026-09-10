import { HeaderConfig } from './headerModel';
import { inchesToMeters } from '../utils/math';

type Engine = {
  name: string;
  displacementL: number;
  cylinders: number;
  boreMm?: number;
  strokeMm?: number;
  redline?: number;
  baselineVE?: number[]; // optional array keyed by RPM index
  baselineVEFunc?: (rpm: number) => number;
};

type SweepPoint = {
  rpm: number;
  torque: number;
  hp: number;
  ve: number;
  exhaustVelocity: number;
};

function defaultVE(rpm: number) {
  // simple baseline VE curve: peaks near 4500
  return 0.75 + 0.15 * Math.exp(-Math.pow((rpm - 4500) / 2500, 2));
}

export function computeSweep(engine: Engine, header: HeaderConfig, rpmArray: number[]): SweepPoint[] {
  const results: SweepPoint[] = [];
  const displacementM3 = engine.displacementL / 1000; // liters to m^3
  const cylinders = engine.cylinders;
  const Vd = displacementM3 / cylinders; // per cylinder m^3

  for (const rpm of rpmArray) {
    const veBase = engine.baselineVEFunc ? engine.baselineVEFunc(rpm) : defaultVE(rpm);

    const exhaustVelocity = computeExhaustVelocity(engine, rpm, header);
    const pressureDrop = darcyWeisbach(header, exhaustVelocity);
    const headerVEfactor = headerTuningFactor(engine, header, rpm);
    const veEffective = Math.max(0.3, veBase * headerVEfactor * Math.exp(-pressureDrop / 10000));

    const imep = veToIMEP(veEffective, Vd);
    const torque = imepToTorque(imep, displacementM3);
    const hp = torque * rpm / 5252;

    results.push({ rpm, torque, hp, ve: veEffective, exhaustVelocity });
  }
  return results;
}

export function computeExhaustVelocity(engine: Engine, rpm: number, header: HeaderConfig) {
  // crude estimate: mass flow per cylinder -> velocity = volumetric flow / area
  const displacementM3 = engine.displacementL / 1000;
  const cylinders = engine.cylinders;
  const Vd = displacementM3 / cylinders;
  const cyclesPerSec = rpm / 60 / 2; // 4-stroke: one exhaust pulse per 2 revs
  const volumetricFlowPerCylinder = Vd * cyclesPerSec * 1.0; // m^3/s (approx)
  const area = Math.PI * Math.pow(inchesToMeters(header.diameterIn) / 2, 2);
  const velocity = volumetricFlowPerCylinder / area;
  return Math.max(0.1, velocity);
}

function darcyWeisbach(header: HeaderConfig, velocity: number) {
  // simplified Darcy-Weisbach pressure drop per meter
  const D = inchesToMeters(header.diameterIn);
  const L = inchesToMeters(header.lengthIn);
  const rho = 1.225;
  const Re = Math.abs(velocity) * D / (1.5e-5); // kinematic viscosity ~1.5e-5 m2/s
  let f = 0.02;
  if (Re > 4000) {
    // Colebrook approximation simplified
    f = 0.25 / Math.pow(Math.log10((header.roughness / (3.7 * D)) + (5.74 / Math.pow(Re, 0.9))), 2);
  }
  const dp = f * (L / D) * 0.5 * rho * velocity * velocity;
  return dp;
}

function headerTuningFactor(engine: Engine, header: HeaderConfig, rpm: number) {
  // crude resonant tuning: tuned frequency ~ c/(4L) where c ~ 340 m/s
  const L = inchesToMeters(header.lengthIn);
  const c = 340;
  const tunedHz = c / (4 * L);
  const firingHz = rpm / 60 / (engine.cylinders / 2); // pulses per second per header (approx)
  const ratio = firingHz / tunedHz;
  // best when ratio ~ 1, apply gaussian bump
  const factor = 1 + 0.12 * Math.exp(-Math.pow((ratio - 1) / 0.25, 2));
  // area effect: very small diameters hurt, very large diameters reduce scavenging
  const area = Math.PI * Math.pow(inchesToMeters(header.diameterIn) / 2, 2);
  const areaRef = Math.PI * Math.pow(inchesToMeters(1.5) / 2, 2);
  const areaFactor = 1 + 0.06 * Math.tanh((areaRef - area) * 50);
  return Math.max(0.6, factor * areaFactor);
}

function veToIMEP(ve: number, Vd: number) {
  // crude IMEP estimate: IMEP ~ (ve * atm_pressure) * some factor
  const patm = 101325;
  const efficiencyFactor = 0.85;
  const imep = ve * patm * efficiencyFactor; // Pa
  return imep;
}

function imepToTorque(imep: number, displacementM3: number) {
  // Torque = IMEP * displacement / (2*pi)
  const torqueNm = imep * displacementM3 / (2 * Math.PI);
  const torqueLbft = torqueNm * 0.737562;
  return torqueLbft;
}
