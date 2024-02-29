import { Controller, type OnStart } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

@Controller()
export class CameraComponentController implements OnStart {
  public onStart(): void {
    const characterCamera = World.CurrentCamera!;
    characterCamera.Name = "CharacterCamera";
    characterCamera.AddTag("CharacterCamera");

    const menuCamera = new Instance("Camera", World);
    menuCamera.Name = "MenuCamera";
    menuCamera.AddTag("MenuCamera");
  }
}