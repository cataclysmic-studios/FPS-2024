import { Character } from "shared/utilities/client";
import { Spring } from "shared/utilities/classes/spring";
import Wave from "shared/utilities/classes/wave";

import type { FpsState } from "shared/structs/fps-state";
import type ProceduralAnimation from "../procedural-animation";

const WAVE_PARAMETERS = <const>[1, 12, -0.5, 0];

export default class WalkCycleAnimation implements ProceduralAnimation {
  private readonly spring = new Spring;

  private readonly sineWave = new Wave(...WAVE_PARAMETERS);
  private readonly cosineWave = new Wave(...WAVE_PARAMETERS);

  public start(): void {
    this.cosineWave.phaseShift = 0.5;
    this.cosineWave.waveFunction = math.cos;
  }

  public update(dt: number, { aimed }: FpsState): Vector3 {
    const epsilon = 0.025;
    const velocity = Character.PrimaryPart!.AssemblyLinearVelocity;
    const walkSpeed = math.max(velocity.sub(new Vector3(0, velocity.Y, 0)).Magnitude - epsilon, 0);
    const waveDamping = 120;
    const x = this.sineWave.update(dt, waveDamping) * walkSpeed;
    const y = this.cosineWave.update(dt, waveDamping) * walkSpeed;
    const force = new Vector3(x / 2, y, x / 1.5).div(aimed ? 1.75 : 1);

    this.spring.shove(force);
    return this.spring.update(dt);
  }
}