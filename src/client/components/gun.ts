import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import type GunData from "shared/structs/gun-data";

@Component({ tag: "Gun" })
export class Gun extends BaseComponent<{}, GunModel> implements OnStart {
  public onStart(): void {
    this.weld();
  }

  public getAnimation(name: AnimationName): Animation {
    return this.instance.Animations[name];
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
      weld.C0 = new CFrame;
      weld.C1 = weld.Part1.CFrame.ToObjectSpace(weld.Part0.CFrame);
      weld.Parent = this.instance.Handle;
    }
  }
}