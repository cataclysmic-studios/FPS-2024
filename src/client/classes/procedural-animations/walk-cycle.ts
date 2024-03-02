import { Character } from "shared/utilities/client";
import { Spring } from "shared/utilities/classes/spring";
import { flattenNumber } from "shared/utilities/helpers";
import Wave from "shared/utilities/classes/wave";

import type { FpsController } from "client/controllers/fps";
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

  public update(dt: number, { state: { aimed } }: FpsController): Vector3 {
    const waveDamping = 50;
    const velocity = Character.PrimaryPart!.AssemblyLinearVelocity;
    const walkSpeed = flattenNumber(velocity.sub(new Vector3(0, velocity.Y, 0)).Magnitude, 0.04);
    const x = walkSpeed === 0 ? 0 : this.sineWave.update(dt, waveDamping, walkSpeed / 18);
    const y = walkSpeed === 0 ? 0 : this.cosineWave.update(dt, waveDamping, walkSpeed / 18);
    const force = new Vector3(x / 2, y, x / 1.5).div(aimed ? 1.75 : 1);

    this.spring.shove(force);
    return this.spring.update(dt);
  }
}