import type Firemode from "./enums/firemode";

type RecoilPattern = [[number, number], [number, number], [number, number]];
interface RecoilSpringModifiers {
  readonly cameraRecoverSpeed: number;
  readonly cameraKickForceDamper: number;
  readonly cameraKickDamper: number;
  readonly cameraKickSpeed: number;
  readonly modelRecoverSpeed: number;
  readonly modelKickForceDamper: number;
  readonly modelKickDamper: number;
  readonly modelKickSpeed: number;
}

export default interface GunData {
  damage: [number, number];
  range: [number, number];
  firerate: number;
  firemodes: Firemode[];
  burstCount?: number;
  ammo: {
    mag: number;
    spare: number;
  };

  aimedStabilization: number;
  recoil: RecoilPattern;
  recoilSpringModifiers: RecoilSpringModifiers

  movingParts: string[];

  zoom: number;
  speed: {
    aim: number;
    equip: number;
    movement: {
      aim: number;
      walk: number;
      sprint: number;
    };
  };
}