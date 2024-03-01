import Wave from "shared/utilities/classes/wave";

import type { FpsController } from "client/controllers/fps";
import type ProceduralAnimation from "../procedural-animation";

export default class BreathingAnimation implements ProceduralAnimation {
  private readonly wave = new Wave;

  public start(): void {}

  public update(dt: number, { state: { aimed } }: FpsController): Vector3 {
    return new Vector3(0, this.wave.update(dt) / (aimed ? 2 : 1), 0);
  }
}