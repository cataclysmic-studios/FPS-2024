import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";

import type { MovementController } from "client/controllers/movement";
import type ProceduralAnimation from "../procedural-animation";

export default class LeanAnimation implements ProceduralAnimation {
  public readonly angle = 15;

  private readonly t = new Instance("NumberValue");
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.3)
    .SetEasingStyle(Enum.EasingStyle.Sine)
    .SetEasingDirection(Enum.EasingDirection.Out)

  public start(movement: MovementController): void {
    movement.leanStateChanged.Connect(leanState => tween(this.t, this.tweenInfo, { Value: leanState }));
  }

  public update(dt: number): Vector3 {
    return new Vector3(this.t.Value);
  }
}