import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

interface Attributes {}

@Component({ tag: "Gun" })
export class Gun extends BaseComponent<Attributes> implements OnStart {
  public onStart(): void {

  }
}