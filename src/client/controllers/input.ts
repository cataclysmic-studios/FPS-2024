import { Controller, type OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";

import { Player } from "shared/utilities/client";
import Slot from "shared/structs/enums/slot";

import type { FpsController } from "./fps";
import type { MovementController } from "./movement";

const { KeyCode: Key } = Enum;

@Controller()
export class InputController implements OnInit {
  public constructor(
    private readonly fps: FpsController,
    private readonly movement: MovementController
  ) {}

  public onInit(): void {
    const mouse = Player.GetMouse();
    mouse.Button1Down.Connect(() => this.fps.shoot());
    mouse.Button2Down.Connect(() => this.fps.aim(true));
    mouse.Button2Up.Connect(() => this.fps.aim(false));

    UserInputService.InputBegan.Connect(({ KeyCode: key }, processed) => {
      if (processed) return;
      switch(key) {
        case Key.One: return this.fps.equipGun(Slot.Primary);
        // case KeyCode.Two: return this.fps.equipGun(Slot.Secondary);
        // case KeyCode.Three: return this.fps.equipMelee(Slot.Melee);

        case Key.LeftShift:
          return this.movement.sprint();

        case Key.Q:
          return this.movement.lean(this.movement.leanDirection() === -1 ? 0 : -1);
        case Key.E:
          return this.movement.lean(this.movement.leanDirection() === 1 ? 0 : 1);
        case Key.C:
          if (this.movement.is("crouched"))
            return this.movement.stand();
          else
            return this.movement.crouch();
        case Key.LeftControl:
          if (this.movement.is("proned"))
            return this.movement.stand();
          else
            return this.movement.prone();
      }
    });
    UserInputService.InputEnded.Connect(({ KeyCode: key }, processed) => {
      if (processed) return;
      switch(key) {
        case Key.LeftShift:
          return this.movement.walk();
      }
    });
  }
}