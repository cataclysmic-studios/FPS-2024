import { Controller, type OnInit } from "@flamework/core";
import type { Components } from "@flamework/components";
import { Workspace as World, UserInputService } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import Signal from "@rbxts/signal";

import { Player } from "shared/utilities/client";
import { Assets } from "shared/utilities/helpers";
import { tween } from "shared/utilities/ui";
import { DEFAULT_FPS_STATE, type FpsState } from "shared/structs/fps-state";
import GunData from "shared/structs/gun-data";
import MeleeData from "shared/structs/melee-data";
import Firemode from "shared/structs/enums/firemode";
import FOV from "shared/structs/enums/fov";
import Slot from "shared/structs/enums/slot";

import type { CharacterController } from "./character";
import type { ViewModel } from "client/components/view-model";
import type { Gun } from "client/components/gun";
import type { CharacterCamera } from "client/components/cameras/character-camera";
import type { ProceduralAnimations } from "client/base-components/procedural-animations";
import Log from "shared/logger";

const { sin, cos, rad } = math;

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

@Controller({ loadOrder: 0 })
export class FpsController implements OnInit {
  public readonly state: FpsState = DEFAULT_FPS_STATE;
  public readonly ammoChanged = new Signal<(newAmmo: { mag: number; spare: number; }) => void>;
  public readonly firemodeChanged = new Signal<(newFiremode: Firemode) => void>;
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
    mouse.Button1Up.Connect(() => this.mouseDown = false);
    task.delay(1.5, () => this.deploy());
  }

  public deploy(): void {
    this.createCharacter(DEFAULT_CHARACTER);
    this.setGun(Slot.Primary, "HK433");
    this.setMelee("Knife");
  }

  public shoot(): void {
    this.mouseDown = true;
    const data = this.getData<GunData>();
    const firemode = this.getCurrentFiremode();
    if (!data) return;
    if (firemode === undefined) return;
    if (!this.vm?.currentGun) return;

    if (this.state.gun.ammo.mag < 1)
      return this.playGunSound("Empty");

    switch(firemode) {
      case Firemode.Auto: {
        while (this.canShoot())
          this.fireShot(data);
        break;
      }
      case Firemode.Burst: {
        const burstCount = data.burstCount ?? 3;
        let shots = 0;
        do {
          if (!this.canShoot()) break;
          this.fireShot(data);
          shots += 1;
        } while (shots < burstCount)
        break;
      }
      case Firemode.Semi:
      case Firemode.Bolt:
        return this.fireShot(data);
    }
  }

  public aim(aimed: boolean): void {
    if (!this.characterCamera) return;
    if (this.state.sprinting) return;
    this.state.aimed = aimed;

    const gunData = this.getData<GunData>()!;
    AIM_TWEEN_INFO.SetTime(0.2 / gunData.speed.aim);

    this.playGunSound(aimed ? "Aim" : "Unaim");
    this.adjustCharacterSpeed();
    tween(UserInputService, AIM_TWEEN_INFO, { // TODO: add setting in future to modify this aim sensitivity
      MouseDeltaSensitivity: 1 / (aimed ? gunData.zoom : 1)
    });
    tween(this.characterCamera.instance, AIM_TWEEN_INFO, {
      FieldOfView: FOV.Base / (aimed ? gunData.zoom : 1)
    });

    const aimOffset = this.vm!.currentGun!.instance.Offsets.Aim.Value
      .mul(this.vm!.currentGun!.instance.Offsets.Main.Value.Inverse());

    this.tweenCFrameManipulator(
      "aim", CFrameManipulationType.ViewModel,
      AIM_TWEEN_INFO,
      aimed ? aimOffset : new CFrame
    );
  }

  public reload(): void {
    const gunData = this.getData<GunData>();
    if (!gunData) return;
    if (!this.vm) return;

    // this.vm.playAnimation("Reload"); // TODO: when finished add new ammo, also add cancelling
    const leftover = this.state.gun.ammo.mag;
    const chamber = leftover > 0 ? 1 : 0;
    const newAmmo = gunData.ammo.mag + chamber;
    this.state.gun.ammo.mag = newAmmo;
    this.state.gun.ammo.spare -= newAmmo - leftover;
    this.ammoChanged.Fire(this.state.gun.ammo);
  }

  public switchFiremode(): void {
    const gunData = this.getData<GunData>();
    if (!gunData) return;
    if (!this.vm) return;

    // this.vm.playAnimation("SwitchFiremode");
    this.state.gun.firemodeIndex += 1;
    this.state.gun.firemodeIndex %= gunData.firemodes.size();
    this.firemodeChanged.Fire(this.getCurrentFiremode()!);
    this.playGunSound("SwitchFiremode");
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
    this.firemodeChanged.Fire(this.getCurrentFiremode()!);
    this.ammoChanged.Fire(gun.getData().ammo);
  }

  public unequip(): void {
    const currentSlot = this.state.currentSlot;
    if (currentSlot === undefined) return;
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

  public getData<T extends GunData | MeleeData = GunData | MeleeData>(): Maybe<T> {
    if (this.state.currentSlot === undefined) return;
    return <T>this.state.weaponData[this.state.currentSlot];
  }

  private canShoot(): boolean {
    return !this.state.shooting && this.mouseDown && this.state.gun.ammo.mag > 0;
  }

  private fireShot({ firerate }: GunData): void {
    if (!this.canShoot()) return;
    this.state.shooting = true;

    this.applyRecoil();
    this.vm!.currentGun!.shoot();
    this.state.gun.ammo.mag -= 1;
    this.ammoChanged.Fire(this.state.gun.ammo);

    task.wait(60 / firerate);
    this.state.shooting = false;
  }

  private playGunSound(name: ExtractKeys<GunModel["Handle"], Sound> | & keyof Gun["sounds"]): void {
    if (!this.vm?.currentGun) return;
    const sound = <Sound>this.vm.currentGun.instance.Handle.FindFirstChild(name) ?? this.vm.currentGun.sounds[<keyof Gun["sounds"]>name];
    sound.Play();
  }

  private applyRecoil(): void {
    if (!this.vm) return;
    if (!this.characterCamera) return;

    const gunData = this.getData<GunData>();
    if (!gunData) return;

    const random = new Random;
    const torqueDirection = random.NextInteger(1, 2) === 1 ? 1 : -1;
    const stabilization = this.getRecoilStabilization(gunData);
    const { recoil: [[y1, y2], [x1, x2], [z1, z2]] } = gunData;
    const force = new Vector3(
      random.NextNumber(y1, y2),
      random.NextNumber(x1, x2),
      random.NextNumber(z1, z2)
    );

    this.vm.kickRecoil(force, stabilization, torqueDirection);
    this.characterCamera.kickRecoil(force, stabilization, torqueDirection);
  }

  private getRecoilStabilization({ aimedStabilization }: GunData): number {
    let stabilization = 1;
    if (this.state.aimed) stabilization += aimedStabilization;
    if (this.state.crouched) stabilization += 0.1;
    if (this.state.proned) stabilization += 0.2;
    return stabilization;
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

  private loadGun(slot: Slot.Primary | Slot.Secondary, gun: Gun): GunData {
    const data = gun.getData();
    this.state.weaponData[slot] = data;
    this.state.gun.ammo.mag = data.ammo.mag;
    this.state.gun.ammo.spare = data.ammo.spare;
    return data;
  }

  private getCurrentFiremode(): Maybe<Firemode> {
    if (this.state.currentSlot === undefined) return;
    if (this.state.currentSlot === Slot.Melee) return;

    const gunData = this.getData<GunData>();
    if (!gunData) return;
    return gunData.firemodes[this.state.gun.firemodeIndex];
  }
}