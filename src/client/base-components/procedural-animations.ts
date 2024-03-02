import { BaseComponent } from "@flamework/components";
import Object from "@rbxts/object-utils";

import BreathingAnimation from "client/classes/procedural-animations/breathing";
import WalkCycleAnimation from "client/classes/procedural-animations/walk-cycle";
import MouseSwayAnimation from "client/classes/procedural-animations/mouse-sway";
import LandingAnimation from "client/classes/procedural-animations/landing";
import RecoilAnimation from "client/classes/procedural-animations/recoil";
import LeanAnimation from "client/classes/procedural-animations/lean";
import CrouchAnimation from "client/classes/procedural-animations/crouch";
import ProneAnimation from "client/classes/procedural-animations/prone";

import type { FpsController } from "client/controllers/fps";
import type { MovementController } from "client/controllers/movement";
import type GunData from "shared/structs/gun-data";

const { rad } = math;

export class ProceduralAnimations<A = {}, I extends Camera | Model = Camera | Model> extends BaseComponent<A, I> {
  public readonly cframeManipulators = {
    aim: new Instance("CFrameValue")
  };

  private readonly connectedToCamera = this.instance.IsA("Camera");
  public readonly animations = {
    breathing: new BreathingAnimation,
    walkCycle: new WalkCycleAnimation,
    mouseSway: new MouseSwayAnimation,
    landing: new LandingAnimation,
    recoil: new RecoilAnimation,

    lean: new LeanAnimation,
    crouch: new CrouchAnimation,
    prone: new ProneAnimation
  };

  public constructor(
    protected readonly fps: FpsController,
    protected readonly movement: MovementController
  ) { super(); }

  public kickRecoil(force: Vector3, stabilization: number, torqueDirection: number): void {
    const gunData = this.fps.getData<GunData>();
    if (!gunData) return;
    this.animations.recoil.kick(gunData, force, stabilization, torqueDirection, this.connectedToCamera);
  }

  protected startProceduralAnimations(): void {
    for (const animation of Object.values(this.animations))
      animation.start(this.movement);
  }

  protected updateProceduralAnimations(dt: number): CFrame {
    const offset = this.connectedToCamera ? this.getCameraOffset(dt) : this.getModelOffset(dt);
    const finalManipulatorOffset = this.combineCFrames(Object.values(this.cframeManipulators).map(manipulator => manipulator.Value));
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
    {
      const { X: lean } = this.animations.lean.update(dt);
      cameraOffsets.push(
        new CFrame(lean, 0, 0)
          .mul(CFrame.Angles(0, 0, rad(-lean * this.animations.lean.angle)))
      );
    }
    {
      const { X: crouch } = this.animations.crouch.update(dt);
      cameraOffsets.push(new CFrame(0, crouch * -1.5, 0));
    }
    {
      const { X: prone } = this.animations.prone.update(dt);
      cameraOffsets.push(new CFrame(0, prone * -2.75, 0));
    }
    {
      const recoil = this.animations.recoil.update(dt, this.fps, this.connectedToCamera);
      cameraOffsets.push(
        new CFrame(0, 0, recoil.Z * 2)
          .mul(CFrame.Angles(recoil.X, recoil.Y, recoil.Y * this.animations.recoil.shakeMultiplier))
      );
    }

    return this.combineCFrames(cameraOffsets);
  }

  private getModelOffset(dt: number): CFrame {
    const modelOffsets: CFrame[] = [];
    {
      const movement = this.animations.walkCycle.update(dt, this.fps).mul(-2.5);
      modelOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X, movement.Z))
      );
    }
    {
      const sway = this.animations.mouseSway.update(dt, this.fps);
      const aimSway = new CFrame(-sway.X, sway.Y, -sway.X)
        .mul(CFrame.Angles(-sway.Y, -sway.X, sway.X));
      const hipSway = new CFrame(-sway.X * 1.75, sway.Y / 1.5, -sway.X * 1.5)
        .mul(CFrame.Angles(-sway.Y / 1.5, -sway.X, 0));

      modelOffsets.push(this.fps.state.aimed ? aimSway : hipSway);
    }
    {
      const movement = this.animations.landing.update(dt, this.fps).div(32);
      modelOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y / 2, 0, 0))
      );
    }
    // {
    //   const { X: crouch } = this.animations.crouch.update(dt);
    //   modelOffsets.push(
    //     new CFrame(0, 0, this.animations.crouch.crouchZOffset)
    //       .mul(CFrame.Angles(0, 0, rad(crouch * this.animations.crouch.crouchAngle)))
    //   );
    // }
    {
      const recoil = this.animations.recoil.update(dt, this.fps, this.connectedToCamera);
      modelOffsets.push(
        new CFrame(0, -recoil.X * 4, -recoil.Z)
          .mul(CFrame.Angles(recoil.X * 2, recoil.Y, recoil.Y * this.animations.recoil.shakeMultiplier))
      );
    }

    return this.combineCFrames(modelOffsets);
  }

  private combineCFrames(cframes: CFrame[]): CFrame {
    return cframes.reduce((sum, cf) => sum.mul(cf), new CFrame);
  }
}