import { Controller } from "@flamework/core";

import type{ FpsState, LeanState } from "shared/structs/fps-state";

import type { FpsController } from "./fps";

@Controller()
export class MovementController {
  public constructor(
    private readonly fps: FpsController
  ) {}

  public is(stateKey: keyof Pick<FpsState, "crouched" | "proned" | "sprinting">): boolean {
    return this.fps.state[stateKey];
  }

  public leanDirection(): LeanState {
    return this.fps.state.leanState;
  }

  public lean(state: LeanState): void {
    this.fps.state.leanState = state;
  }

  public crouch(): void {
    this.fps.state.proned = false;
    this.fps.state.crouched = true;
    this.fps.state.sprinting = false;
  }

  public prone(): void {
    this.fps.state.proned = true;
    this.fps.state.crouched = false;
    this.fps.state.sprinting = false;
    this.fps.state.leanState = 0;
  }

  public stand(): void {
    this.fps.state.proned = false;
    this.fps.state.crouched = false;
    this.fps.state.sprinting = false;
  }

  public sprint(): void {
    this.fps.state.sprinting = true;
    this.fps.state.proned = false;
    this.fps.state.crouched = false;
    this.fps.state.leanState = 0;
  }

  public walk(): void {
    this.fps.state.sprinting = false;
  }
}