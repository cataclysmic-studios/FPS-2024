import { Controller } from "@flamework/core";

import { Character } from "shared/utilities/client";
import type { FpsState } from "shared/structs/fps-state";

import type GunData from "shared/structs/gun-data";
import type MeleeData from "shared/structs/melee-data";
import { tween } from "shared/utilities/ui";
import { TweenInfoBuilder } from "@rbxts/builders";

const SPEED_DAMP = { // a number your walkspeed will be divided by
  crouched: 2.25,
  proned: 3.5
}

@Controller()
export class CharacterController {
  public adjustSpeed(data: GunData | MeleeData, { sprinting, aimed, crouched, proned }: FpsState): void {
    const humanoid = Character.FindFirstChildOfClass("Humanoid");
    if (!humanoid) return;

    const speed = (sprinting ? data.speed.movement.sprint : (
        (aimed && "aim" in data.speed.movement) ? data.speed.movement.aim : data.speed.movement.walk
      ))
      / (crouched ? SPEED_DAMP.crouched : 1)
      / (proned ? SPEED_DAMP.proned : 1);

    tween(humanoid, new TweenInfoBuilder().SetTime(0.2), { WalkSpeed: speed });
  }
}