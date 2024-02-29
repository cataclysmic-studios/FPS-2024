import { Character } from "shared/utilities/client";
import { Spring } from "shared/utilities/classes/spring";
import type ProceduralAnimation from "../procedural-animation";

const { clamp } = math;

export default class LandingAnimation implements ProceduralAnimation {
  private readonly spring = new Spring(4, 40, 4, 4);

  public start(): void {}

  public update(dt: number): Vector3 {
    this.shoveLandingSpring(Character.PrimaryPart!.AssemblyLinearVelocity.div(12));
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3) {
    const landingVelocity = clamp(fallingVelocity.Y, -80, 0);
    this.spring.shove(new Vector3(0, landingVelocity, 0));
    task.delay(0.11, () => this.spring.shove(new Vector3(0, -landingVelocity, 0)));
  }
}