import { Controller, type OnInit } from "@flamework/core";
import type { Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

import { Player } from "shared/utilities/client";
import { Assets } from "shared/utilities/helpers";
import { tween } from "shared/utilities/ui";
import { DEFAULT_FPS_STATE, type FpsState } from "shared/structs/fps-state";
import GunData from "shared/structs/gun-data";
import MeleeData from "shared/structs/melee-data";
import FOV from "shared/structs/enums/fov";
import Slot from "shared/structs/enums/slot";

import type { CharacterController } from "./character";
import type { ViewModel } from "client/components/view-model";
import type { Gun } from "client/components/gun";
import type { CharacterCamera } from "client/components/cameras/character-camera";
import type { ProceduralAnimations } from "client/base-components/procedural-animations";
import Log from "shared/logger";

const enum CFrameManipulationType {
  Camera,
  ViewModel,
  Both
}

interface CharacterCreationOptions {
  readonly arms: ArmsName;
}

const AIM_TWEEN_INFO = new TweenInfoBuilder()
  .SetEasingStyle(Enum.EasingStyle.Cubic);

const DEFAULT_CHARACTER: CharacterCreationOptions = {
  arms: "Standard"
};

@Controller()
export class FpsController implements OnInit {
  public readonly state: FpsState = DEFAULT_FPS_STATE;
  public vm?: ViewModel;
  public characterCamera?: CharacterCamera;

  private mouseDown = false;

  public constructor(
    private readonly components: Components,
    private readonly character: CharacterController
  ) {
    this.characterCamera = components.getComponent(World.CurrentCamera!);
    components.onComponentAdded<CharacterCamera>(camera => this.characterCamera = camera);
  }

  public onInit(): void {
    const mouse = Player.GetMouse();
    mouse.Button1Down.Connect(() => this.mouseDown = true);
    mouse.Button1Up.Connect(() => this.mouseDown = false);
    task.delay(1.5, () => this.deploy());
  }

  private deploy(): void {
    this.createCharacter(DEFAULT_CHARACTER);
    this.setGun(Slot.Primary, "HK433");
    this.setMelee("Knife");
  }

  public shoot(): void {
    this.state.shooting = true;
  }

  public aim(aimed: boolean): void {
    if (!this.characterCamera) return;
    if(!this.vm?.currentGun) return;
    this.state.aimed = aimed;

    const gunData = this.getData<GunData>()!;
    AIM_TWEEN_INFO.SetTime(0.2 / gunData.speed.aim);

    this.adjustCharacterSpeed();
    tween(this.characterCamera.instance, AIM_TWEEN_INFO, {
      FieldOfView: FOV.Base / (aimed ? gunData.zoom : 1)
    });
    this.tweenCFrameManipulator(
      "aim", CFrameManipulationType.ViewModel,
      AIM_TWEEN_INFO,
      aimed ? this.vm.currentGun.instance.Offsets.Aim.Value : new CFrame
    );
  }

  public adjustCharacterSpeed() {
    const data = this.getData();
    if (!data) return;
    this.character.adjustSpeed(data, this.state);
  }

  public cleanupCharacter(): void {
    this.vm?.destroy();
  }

  public createCharacter(options: CharacterCreationOptions): void {
    const arms = Assets.Character.Arms[options.arms].Clone();
    this.vm = this.components.addComponent<ViewModel>(arms);
  }

  public equipGun(slot: Slot.Primary | Slot.Secondary): void {
    if (slot === this.state.currentSlot) return;
    this.unequip();

    const gunName = this.state.guns[slot];
    if (!this.vm) return;
    if (!gunName) return;
    Log.info("Equipped " + gunName);
    this.state.currentSlot = slot;

    const gun = this.vm.addGun(gunName);
    // this.vm.playAnimation("Equip", data.speed.equip);
    this.vm.playAnimation("Idle"); // temp
    this.loadGun(slot, gun);
    this.adjustCharacterSpeed();
  }

  public unequip(): void {
    if (!this.state.currentSlot) return;
    if (!this.vm) return;
    this.vm.removeGun();
    // this.vm.playAnimation("Unequip", data.speed.equip);
    this.state.currentSlot = undefined;
  }

  public setGun(slot: Slot.Primary | Slot.Secondary, gunName: ExtractKeys<typeof Assets.Guns, GunModel>): void {
    this.state.guns[slot] = gunName;
  }

  public setMelee(meleeName: ExtractKeys<typeof Assets.Melees, MeleeModel>): void {
    this.state.melee = meleeName;
  }

  private tweenCFrameManipulator(
    name: keyof ProceduralAnimations["cframeManipulators"],
    manipulationType: CFrameManipulationType,
    info: TweenInfoBuilder,
    target: CFrame
  ): void {

    if (!this.characterCamera) return;
    if (!this.vm) return;

    if ([CFrameManipulationType.Camera, CFrameManipulationType.Both].includes(manipulationType))
      tween(this.characterCamera.cframeManipulators[name], info, { Value: target });
    if ([CFrameManipulationType.ViewModel, CFrameManipulationType.Both].includes(manipulationType))
      tween(this.vm.cframeManipulators[name], info, { Value: target });
  }

  private getData<T extends GunData | MeleeData = GunData | MeleeData>(): Maybe<T> {
    if (this.state.currentSlot === undefined) return;
    return <T>this.state.weaponData[this.state.currentSlot];
  }

  private loadGun(slot: Slot.Primary | Slot.Secondary, gun: Gun): GunData {
    const data = gun.getData();
    this.state.weaponData[slot] = data;
    return data;
  }
}