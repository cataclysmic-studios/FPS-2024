import { Controller } from "@flamework/core";
import Signal from "@rbxts/signal";

import type { FpsState, LeanState } from "shared/structs/fps-state";

import type { FpsController } from "./fps";
import { Character } from "shared/utilities/client";

@Controller()
export class MovementController {
  public readonly leanStateChanged = new Signal<(newState: LeanState) => void>;
  public readonly crouched = new Signal;
  public readonly proned = new Signal;
  public readonly stood = new Signal;

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
    this.leanStateChanged.Fire(this.fps.state.leanState);
  }

  public slide(): void {
    this.crouch();

    const root = Character.PrimaryPart!;
    const baseForce = 50;
    const loops = 16;
    const baseTime = 0.15;
    const smoothness = 2;
    for (let i = 1; i <= loops; i++) {
      root.AssemblyLinearVelocity = root.AssemblyLinearVelocity
        .add(root.CFrame.UpVector.mul(-1 / i))
        .add(root.CFrame.LookVector.mul(baseForce / (i / smoothness)));

      task.wait(baseTime / i);
    }
  }

  public crouch(): void {
    this.fps.state.proned = false;
    this.fps.state.crouched = true;
    this.fps.state.sprinting = false;
    this.fps.adjustCharacterSpeed();
    this.crouched.Fire();
  }

  public prone(): void {
    this.fps.state.proned = true;
    this.fps.state.crouched = false;
    this.fps.state.sprinting = false;
    this.fps.state.leanState = 0;
    this.fps.adjustCharacterSpeed();
    this.proned.Fire();
  }

  public stand(): void {
    this.fps.state.proned = false;
    this.fps.state.crouched = false;
    this.fps.state.sprinting = false;
    this.fps.adjustCharacterSpeed();
    this.stood.Fire();
  }

  public sprint(): void {
    if (this.fps.state.aimed)
      this.fps.aim(false);
    if (this.fps.state.leanState !== 0)
      this.lean(0);

    this.stand();
    this.fps.state.sprinting = true;
    this.fps.state.leanState = 0;
    this.fps.adjustCharacterSpeed();
  }

  public walk(): void {
    this.fps.state.sprinting = false;
    this.fps.adjustCharacterSpeed();
  }
}