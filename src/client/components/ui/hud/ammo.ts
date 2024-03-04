import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { PlayerGui } from "shared/utilities/client";
import Firemode from "shared/structs/enums/firemode";

import type { FpsController } from "client/controllers/fps";

@Component({
  tag: "AmmoHUD",
  ancestorWhitelist: [ PlayerGui ]
})
export class AmmoHUD extends BaseComponent<{}, PlayerGui["HUD"]["Ammo"]> implements OnStart {
  public constructor(
    private readonly fps: FpsController
  ) { super(); }

  public onStart(): void {
    this.fps.firemodeChanged.Connect(firemode => this.instance.Firemode.Text = `- ${Firemode[firemode].upper()} -`);
    this.fps.ammoChanged.Connect(({ mag, spare }) => {
      this.instance.Mag.Text = tostring(mag);
      this.instance.Spare.Text = tostring(spare);
    });
  }
}