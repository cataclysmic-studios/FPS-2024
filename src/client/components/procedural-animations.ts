import { BaseComponent } from "@flamework/components";
import Object from "@rbxts/object-utils";

import BreathingAnimation from "client/classes/procedural-animations/breathing";
import WalkCycleAnimation from "client/classes/procedural-animations/walk-cycle";
import LandingAnimation from "client/classes/procedural-animations/landing";

import type { FpsController } from "client/controllers/fps";

const { rad } = math;

export class ProceduralAnimations<A = {}, I extends Camera | Model = Camera | Model> extends BaseComponent<A, I> {
  public readonly cframeManipulators = {
    aim: new Instance("CFrameValue")
  };
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
    const offset = this.instance.IsA("Camera") ? this.getCameraOffset(dt) : this.getModelOffset(dt);
    const finalManipulatorOffset = Object.values(this.cframeManipulators)
      .map(manipulator => manipulator.Value)
      .reduce((sum, offset) => sum.mul(offset), new CFrame);

    return offset.mul(finalManipulatorOffset);
  }

  private getCameraOffset(dt: number): CFrame {
    const cameraOffsets: CFrame[] = [];
    {
      const movement = this.animations.breathing.update(dt, this.fps);
      cameraOffsets.push(new CFrame(0, movement.Y * 2, 0));
    }
    {
      const movement = this.animations.walkCycle.update(dt, this.fps);
      cameraOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt, this.fps, true).div(8);
      cameraOffsets.push(
        new CFrame(0, movement.Y / 8, 0)
          .mul(CFrame.Angles(rad(movement.Y), 0, 0))
      );
    }

    return cameraOffsets.reduce((sum, offset) => sum.mul(offset), new CFrame);
  }

  private getModelOffset(dt: number): CFrame {
    const modelOffsets: CFrame[] = [];
    {
      const movement = this.animations.walkCycle.update(dt, this.fps);
      modelOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt, this.fps).div(32);
      modelOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y / 2, 0, 0))
      );
    }

    return modelOffsets.reduce((sum, offset) => sum.mul(offset), new CFrame);
  }
}