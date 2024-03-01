export default interface MeleeData {
  damage: [number, number];
  range: [number, number];
  attackSpeed: number;

  speed: {
    equip: number;
    walk: number;
    sprint: number;
  };
}