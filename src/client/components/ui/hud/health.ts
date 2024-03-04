import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Character, Player, PlayerGui } from "shared/utilities/client";

import type { FpsController } from "client/controllers/fps";

@Component({
  tag: "HealthHUD",
  ancestorWhitelist: [ PlayerGui ]
})
export class HealthHUD extends BaseComponent<{}, PlayerGui["HUD"]["Health"]> implements OnStart {
  private humanoid = <Humanoid>Character.WaitForChild("Humanoid");

  public constructor(
    private readonly fps: FpsController
  ) { super(); }

  public onStart(): void {
    this.syncHealth();
    Player.CharacterAdded.Connect(character => {
      this.humanoid = <Humanoid>character.WaitForChild("Humanoid");
      this.syncHealth();
    });
  }

  private syncHealth(): void {
    this.humanoid.HealthChanged.Connect(() => this.instance.Bar.Size = UDim2.fromScale(this.humanoid.Health / this.humanoid.MaxHealth, 1));
  }
}