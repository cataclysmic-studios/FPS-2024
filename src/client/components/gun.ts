import type { OnStart, OnRender } from "@flamework/core";
import { Component, BaseComponent, type Components } from "@flamework/components";

import type GunData from "shared/structs/gun-data";
import type { ViewModel } from "./view-model";

@Component({ tag: "Gun" })
export class Gun extends BaseComponent<{}, GunModel> implements OnStart, OnRender {
  private readonly vm: ViewModel;
  private welded = false;

  public constructor(
    private readonly components: Components
  ) {
    super();
    this.vm = this.components.getComponent(this.instance.Parent!)!;
  }

  public onStart(): void {
    this.weld();
  }

  public onRender(dt: number): void {
    if (!this.welded) return;
    this.instance.Handle.CFrame = this.vm.instance.Mesh.chest["arm.R"]["elbow.R"]["forearm.R"]["hand.R"].CFrame;
  }

  public getData(): GunData {
    return <GunData>require(this.instance.Data);
  }

  private weld(): void {
    const data = this.getData();
    const parts = this.instance.GetChildren()
      .filter((child): child is BasePart => child.IsA("BasePart"));

    for (const part of parts) {
      const weld = new Instance(data.movingParts.includes(part.Name) ? "Motor6D" : "Weld");
      weld.Name = part.Name;
      weld.Part0 = this.instance.Handle;
      weld.Part1 = part;
      weld.Parent = this.instance.Handle;
    }
    this.welded = true;
  }
}