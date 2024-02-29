import type { OnStart, OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";

import { Assets } from "shared/utilities/helpers";

import { ProceduralAnimations } from "./procedural-animations";
import type { Gun } from "./gun";
import type { FpsController } from "client/controllers/fps";

@Component({ tag: "ViewModel" })
export class ViewModel extends ProceduralAnimations<{}, ArmsModel> implements OnStart, OnRender {
  private readonly janitor = new Janitor;

  public constructor(
    private readonly components: Components,
    fps: FpsController
  ) { super(fps); }

  public onStart(): void {
    this.instance.Parent = <Camera>World.WaitForChild("CharacterCamera");
    this.startProceduralAnimations();
  }

  public onRender(dt: number): void {
    if (!this.instance.Parent) return;

    const camera = <Camera>this.instance.Parent;
    const animationOffset = this.updateProceduralAnimations(dt);
    this.instance.PivotTo(
      camera.CFrame
        .mul(animationOffset)
    );
  }

  public addGun(gunName: GunName): Gun {
    const gun = Assets.Guns[gunName].Clone();
    gun.PivotTo(this.instance.GetPivot());
    gun.Parent = this.instance;
    return this.janitor.Add(this.components.addComponent<Gun>(gun), "destroy");
  }

  public destroy(): void {
    this.janitor.Destroy();
  }
}