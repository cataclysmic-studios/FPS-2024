export default interface MeleeData {
  damage: [number, number];
  range: [number, number];
  attackSpeed: number;

  speed: {
    equip: number;
    movement: {
      walk: number;
      sprint: number;
    };
  };
}