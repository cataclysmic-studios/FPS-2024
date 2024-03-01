import type { OnStart } from "@flamework/core";
import { Component, BaseComponent, type Components } from "@flamework/components";

import type GunData from "shared/structs/gun-data";
import type { ViewModel } from "./view-model";

@Component({ tag: "Gun" })
export class Gun extends BaseComponent<{}, GunModel> implements OnStart {
  private readonly vm: ViewModel;

  public constructor(
    private readonly components: Components
  ) {
    super();
    this.vm = this.components.getComponent(this.instance.Parent!)!;
  }

  public onStart(): void {
    this.weld();
    this.instance.Handle.CFrame = this.vm.weaponAttachment.WorldCFrame;

    const attachment = new Instance("Attachment", this.instance.Handle);
    attachment.CFrame = this.instance.Offsets.Gun.Value;

    const rigid = new Instance("RigidConstraint");
    rigid.Attachment0 = attachment;
    rigid.Attachment1 = this.vm.weaponAttachment;
    rigid.Parent = this.instance.Handle;
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