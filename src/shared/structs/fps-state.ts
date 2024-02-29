import Firemode from "./enums/firemode";
import Slot from "./enums/slot";

export type LeanState = -1 | 0 | 1;
export type RecoilPattern = [[number, number], [number, number], [number, number]];
type GunsInventory = [Maybe<GunName>, Maybe<GunName>];

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
  guns: GunsInventory;
  melee?: MeleeName;
  gun: {
    firemode: Firemode,
    ammo: {
      mag: number;
      reserve: number;
    }
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
  guns: <GunsInventory>[undefined, undefined],
  knife: undefined,
  gun: {
    firemode: Firemode.Auto,
    ammo: {
      mag: 0,
      reserve: 0
    }
  }
};