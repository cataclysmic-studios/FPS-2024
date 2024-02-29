import Wave from "shared/utilities/classes/wave";

import type ProceduralAnimation from "../procedural-animation";

export default class BreathingAnimation implements ProceduralAnimation {
  private readonly wave = new Wave;

  public start(): void {}

  public update(dt: number): Vector3 {
    return new Vector3(0, this.wave.update(dt), 0);
  }
}