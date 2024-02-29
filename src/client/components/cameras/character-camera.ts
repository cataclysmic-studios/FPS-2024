import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";

import { Character, Player } from "shared/utilities/client";
import Log from "shared/logger";

import { ProceduralAnimations } from "../procedural-animations";
import type { FpsController } from "client/controllers/fps";

@Component({ tag: "CharacterCamera" })
export class CharacterCamera extends ProceduralAnimations<{}, Camera> implements OnStart, OnRender {
  public constructor(fps: FpsController) {
    super(fps);
  }

  public onStart(): void {
    Log.info("Started CharacterCamera");
    Player.CameraMode = Enum.CameraMode.LockFirstPerson;
    this.startProceduralAnimations();
  }

  public onRender(dt: number): void {
    if (!Character) return;

    const animationOffset = this.updateProceduralAnimations(dt);
    this.instance.CFrame = this.instance.CFrame
      .mul(animationOffset);
  }
}