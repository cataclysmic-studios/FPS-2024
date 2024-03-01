import { UserInputService } from "@rbxts/services";

import { Spring } from "shared/utilities/classes/spring";

import type { FpsController } from "client/controllers/fps";
import type ProceduralAnimation from "../procedural-animation";

const { clamp } = math;

export default class MouseSwayAnimation implements ProceduralAnimation {
  private readonly spring = new Spring;

  public start(): void {}

  public update(dt: number, { state: { aimed } }: FpsController): Vector3 {
    const { X, Y } = UserInputService.GetMouseDelta().div(300);
    const limit = 0.05 / (aimed ? 2 : 1);
    const swayForce = new Vector3(
      clamp(X, -limit, limit),
      clamp(Y, -limit, limit)
    );

    this.spring.shove(swayForce);
    return this.spring.update(dt).div(aimed ? 3 : 1);
  }
}