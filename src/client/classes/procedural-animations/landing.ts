import { Character } from "shared/utilities/client";
import { Spring } from "shared/utilities/classes/spring";

import type { FpsController } from "client/controllers/fps";
import type ProceduralAnimation from "../procedural-animation";

const { clamp, abs } = math;

export default class LandingAnimation implements ProceduralAnimation {
  private readonly spring = new Spring(2, 40, 4, 4);

  public start(): void {}

  public update(dt: number, { state: { aimed } }: FpsController, springReturn?: boolean): Vector3 {
    this.shoveLandingSpring(Character.PrimaryPart!.AssemblyLinearVelocity.div(12 * (aimed ? 3 : 1)), springReturn);
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3, springReturn = false) {
    const velocity = clamp(-abs(fallingVelocity.Y), -80, 0);
    this.spring.shove(new Vector3(0, velocity, 0));
    if (!springReturn) return;
    task.delay(0.11, () => this.spring.shove(new Vector3(0, -velocity, 0)));
  }
}