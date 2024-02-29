import { BaseComponent } from "@flamework/components";
import Object from "@rbxts/object-utils";

import BreathingAnimation from "client/classes/procedural-animations/breathing";
import WalkCycleAnimation from "client/classes/procedural-animations/walk-cycle";
import LandingAnimation from "client/classes/procedural-animations/landing";

import type { FpsController } from "client/controllers/fps";

const { rad } = math;

export class ProceduralAnimations<A = {}, I extends Camera | Model = Camera | Model> extends BaseComponent<A, I> {
  private readonly animations = {
    breathing: new BreathingAnimation,
    walkCycle: new WalkCycleAnimation,
    landing: new LandingAnimation
  };

  public constructor(
    protected readonly fps: FpsController
  ) { super(); }

  public startProceduralAnimations(): void {
    for (const animation of Object.values(this.animations))
      animation.start();
  }

  public updateProceduralAnimations(dt: number): CFrame {
    if (this.instance.IsA("Camera"))
      return this.getCameraOffset(dt);
    else
      return this.getModelOffset(dt);
  }

  private getCameraOffset(dt: number) {
    const cameraOffsets: CFrame[] = [];
    {
      const movement = this.animations.breathing.update(dt);
      cameraOffsets.push(new CFrame(0, movement.Y, 0));
    }
    {
      const movement = this.animations.walkCycle.update(dt, this.fps.state);
      cameraOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt).div(6);
      cameraOffsets.push(CFrame.Angles(rad(movement.Y), 0, 0));
    }

    return cameraOffsets.reduce((sum, offset) => sum.mul(offset), new CFrame);
  }

  private getModelOffset(dt: number) {
    const modelOffsets: CFrame[] = [];
    {
      const movement = this.animations.walkCycle.update(dt, this.fps.state);
      modelOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt).div(16);
      modelOffsets.push(new CFrame(0, movement.Y, 0));
    }

    return modelOffsets.reduce((sum, offset) => sum.mul(offset), new CFrame);
  }
}