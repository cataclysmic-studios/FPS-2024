type ArmsName = ExtractKeys<ReplicatedFirst["Assets"]["Character"]["Arms"], ArmsModel>;
type GunName = ExtractKeys<ReplicatedFirst["Assets"]["Guns"], GunModel>;
type MeleeName = ExtractKeys<ReplicatedFirst["Assets"]["Melees"], MeleeModel>;

interface ArmsModel extends Model {
  AnimationController: AnimationController;
}

interface MeleeOffsetsFolder extends Folder {
  Main: CFrameValue;
  Aim: CFrameValue;
}

interface MeleeModel extends Model {
  Offsets: MeleeOffsetsFolder;
}

interface GunOffsetsFolder extends Folder {
  Main: CFrameValue;
  Aim: CFrameValue;
}

interface GunModel extends Model {
  Offsets: GunOffsetsFolder;
  Bolt: BasePart;
  Mag: BasePart;
  Handle: BasePart;
}