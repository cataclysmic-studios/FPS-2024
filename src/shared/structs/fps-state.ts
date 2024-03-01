import Firemode from "./enums/firemode";
import type Slot from "./enums/slot";
import type GunData from "./gun-data";
import type MeleeData from "./melee-data";

export type LeanState = -1 | 0 | 1;
type GunsInventory = [Maybe<GunName>, Maybe<GunName>];
type WeaponData = [Maybe<GunData>, Maybe<GunData>, Maybe<MeleeData>];

export interface FpsState {
  equipped: boolean;
  aimed: boolean;
  crouched: boolean;
  proned: boolean;
  shooting: boolean;
  reloading: boolean;
  inspecting: boolean;
  sprinting: boolean;
  leanState: LeanState;

  currentSlot?: Slot;
  melee?: MeleeName;
  readonly guns: GunsInventory;
  readonly weaponData: WeaponData;
  readonly gun: {
    firemode: Firemode,
    ammo: {
      mag: number;
      spare: number;
    };
  };
}

export const DEFAULT_FPS_STATE = {
  equipped: false,
  aimed: false,
  crouched: false,
  proned: false,
  shooting: false,
  reloading: false,
  inspecting: false,
  sprinting: false,
  leanState: <LeanState>0,

  currentSlot: undefined,
  knife: undefined,
  guns: <GunsInventory>[undefined, undefined],
  weaponData: <WeaponData>[undefined, undefined, undefined],
  gun: {
    firemode: Firemode.Auto,
    ammo: {
      mag: 0,
      spare: 0
    }
  }
};