import type { FpsController } from "client/controllers/fps";

export default abstract class ProceduralAnimation {
  public abstract start(...extra: any): void;
  public abstract update(dt: number, fps: FpsController, ...extra: any): Vector3;
}