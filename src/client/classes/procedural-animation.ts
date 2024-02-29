export default abstract class ProceduralAnimation {
  public abstract start(): void;
  public abstract update(dt: number, ...extra: any): Vector3;
}