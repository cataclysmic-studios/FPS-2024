import { Controller, type OnRender } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";
import Signal from "@rbxts/signal";

import { tween } from "shared/utilities/ui";
import type { FpsState, LeanState } from "shared/structs/fps-state";

import type { FpsController } from "./fps";
import { Character } from "shared/utilities/client";

@Controller()
export class MovementController implements OnRender {
  public readonly leanStateChanged = new Signal<(newState: LeanState) => void>;
  public readonly crouched = new Signal;
  public readonly proned = new Signal;
  public readonly stood = new Signal;

  private slideDebounce = false;
  private readonly slideCooldown = 1;
  private readonly slideForce = 14;
  private readonly slideT = new Instance("NumberValue");
  private readonly slideInInfo = new TweenInfoBuilder()
    .SetTime(0.15)
    .SetEasingStyle(Enum.EasingStyle.Quint)
    .SetEasingDirection(Enum.EasingDirection.Out)
  private readonly slideOutInfo = new TweenInfoBuilder()
    .SetTime(1.25)
    .SetEasingStyle(Enum.EasingStyle.Quint)
    .SetEasingDirection(Enum.EasingDirection.Out)

  public constructor(
    private readonly fps: FpsController
  ) {}

  public onRender(dt: number): void {
    const root = Character.PrimaryPart;
    if (!root) return;
    if (this.slideT.Value === 0) return;

    const velocity = root.AssemblyLinearVelocity;
    root.AssemblyLinearVelocity = velocity
      .add(root.CFrame.LookVector.mul(this.slideT.Value * this.slideForce));
  }

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
    if (this.slideDebounce) return;
    this.slideDebounce = true;

    this.crouch();
    tween(this.slideT, this.slideInInfo, { Value: 1 })
      .Completed.Once(() => tween(this.slideT, this.slideOutInfo, { Value: 0 }));

    task.delay(this.slideCooldown, () => this.slideDebounce = false);
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