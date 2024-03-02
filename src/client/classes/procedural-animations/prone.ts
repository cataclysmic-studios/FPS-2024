import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";

import type { MovementController } from "client/controllers/movement";
import type ProceduralAnimation from "../procedural-animation";

export default class ProneAnimation implements ProceduralAnimation {
  private readonly t = new Instance("NumberValue");
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.5)
    .SetEasingStyle(Enum.EasingStyle.Sine)
    .SetEasingDirection(Enum.EasingDirection.Out)

  public start(movement: MovementController): void {
    movement.stood.Connect(() => tween(this.t, this.tweenInfo, { Value: 0 }));
    movement.crouched.Connect(() => tween(this.t, this.tweenInfo, { Value: 0 }));
    movement.proned.Connect(() => tween(this.t, this.tweenInfo, { Value: 1 }));
  }

  public update(dt: number): Vector3 {
    return new Vector3(this.t.Value);
  }
}