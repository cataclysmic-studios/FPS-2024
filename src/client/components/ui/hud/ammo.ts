import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { PlayerGui } from "shared/utilities/client";

@Component({
  tag: "AmmoHUD",
  ancestorWhitelist: [ PlayerGui ]
})
export class AmmoHUD extends BaseComponent<{}, PlayerGui["HUD"]["Ammo"]> implements OnStart {
  public onStart(): void {

  }
}