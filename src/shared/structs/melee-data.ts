export default interface MeleeData {
  readonly damage: readonly [number, number];
  readonly range: readonly [number, number];
  readonly attackSpeed: number;

  readonly speed: {
    readonly equip: number;
    readonly movement: {
      readonly walk: number;
      readonly sprint: number;
    };
  };
}