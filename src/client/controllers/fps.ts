import { Controller, type OnInit } from "@flamework/core";
import type { Components } from "@flamework/components";

import { Assets } from "shared/utilities/helpers";
import { DEFAULT_FPS_STATE, type FpsState } from "shared/structs/fps-state";
import Slot from "shared/structs/enums/slot";

import type { ViewModel } from "client/components/view-model";
import type { Gun } from "client/components/gun";

interface CharacterCreationOptions {
  readonly arms: ArmsName;
}

@Controller()
export class FpsController implements OnInit {
  public readonly state: FpsState = DEFAULT_FPS_STATE;
  private vm?: ViewModel;

  public constructor(
    private readonly components: Components
  ) {}

  public onInit(): void {
    this.createCharacter({
      arms: "Standard"
    });
  }

  public cleanupCharacter(): void {
    this.vm?.destroy();
  }

  public createCharacter(options: CharacterCreationOptions): void {
    const arms = Assets.Character.Arms[options.arms].Clone();
    this.vm = this.components.addComponent<ViewModel>(arms);
  }

  public equipGun(slot: Slot.Primary | Slot.Secondary): void {
    const gunName = this.state.guns[slot === Slot.Primary ? 0 : 1];
    if (!this.vm) return;
    if (!gunName) return;

    const gun = this.vm.addGun(gunName);
    this.loadGun(slot, gun);
  }

  public loadGun(slot: Slot.Primary | Slot.Secondary, gun: Gun): void {
    this.state.weaponData[slot === Slot.Primary ? 0 : 1] = gun.getData();
  }

  public setGun(slot: Slot.Primary | Slot.Secondary, gunName: ExtractKeys<typeof Assets.Guns, GunModel>): void {
    this.state.guns[slot === Slot.Primary ? 0 : 1] = gunName;
  }

  public setMelee(meleeName: ExtractKeys<typeof Assets.Melees, MeleeModel>): void {
    this.state.melee = meleeName;
  }

  public setSlot(slot: Slot): void {
    this.state.currentSlot = slot;
    switch(slot) {
      case Slot.Primary: {
        // Load gun @ slot 1
        break;
      }
      case Slot.Secondary: {
        // Load gun @ slot 2
        break;
      }
      case Slot.Melee: {
        // Load melee
        break;
      }
    }
  }
}