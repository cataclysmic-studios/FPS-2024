import type Firemode from "./enums/firemode";

type RecoilPattern = readonly [[number, number], [number, number], [number, number]];
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

type GunClass =
  | "Assault Rifle"
  | "Carbine"
  | "Shotgun"
  | "SMG"
  | "LMG"
  | "Marksman Rifle"
  | "Sniper Rifle"
  | "Pistol"
  | "Machine Pistol"
  | "Revolver";

export default interface GunData {
  readonly class: GunClass;

  readonly damage: readonly [number, number];
  readonly range: readonly [number, number];
  readonly firerate: number;
  readonly firemodes: readonly Firemode[];
  readonly burstCount?: number;
  readonly ammo: {
    readonly mag: number;
    readonly spare: number;
  };

  readonly aimedStabilization: number;
  readonly recoil: RecoilPattern;
  readonly recoilSpringModifiers: RecoilSpringModifiers

  readonly movingParts: string[];

  readonly zoom: number;
  readonly speed: {
    readonly aim: number;
    readonly equip: number;
    readonly movement: {
      readonly aim: number;
      readonly walk: number;
      readonly sprint: number;
    };
  };
}