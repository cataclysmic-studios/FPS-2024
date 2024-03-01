import type Firemode from "./enums/firemode";

type RecoilPattern = [[number, number], [number, number], [number, number]];

export default interface GunData {
  damage: [number, number];
  range: [number, number];
  firemodes: Firemode[];
  recoil: RecoilPattern;
  ammo: {
    mag: number;
    spare: number;
  };

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