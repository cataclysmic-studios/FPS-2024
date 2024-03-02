type ArmsName = ExtractKeys<ReplicatedFirst["Assets"]["Character"]["Arms"], ArmsModel>;
type GunName = ExtractKeys<ReplicatedFirst["Assets"]["Guns"], GunModel>;
type MeleeName = ExtractKeys<ReplicatedFirst["Assets"]["Melees"], MeleeModel>;

type AnimationName = ExtractKeys<GunModel["Animations"], Animation> | ExtractKeys<MeleeModel["Animations"], Animation>;

interface ArmsModel extends Model {
  Mesh: MeshPart & {
    chest: Bone & {
      ["arm.L"]: Bone & {
        ["elbow.L"]: Bone & {
          ["forearm.L"]: Bone & {
            ["hand.L"]: Bone;
          };
        };
      };
      ["arm.R"]: Bone & {
        ["elbow.R"]: Bone & {
          ["forearm.R"]: Bone & {
            ["hand.R"]: Bone;
          };
        };
      };
    };
  };
  AnimationController: AnimationController;
}

interface CommonAnimationsFolder extends Folder {
  Idle: Animation;
}

interface MeleeOffsetsFolder extends Folder {
  Main: CFrameValue;
  Aim: CFrameValue;
}

interface MeleeAnimationsFolder extends CommonAnimationsFolder {

}

interface MeleeModel extends Model {
  Offsets: MeleeOffsetsFolder;
  Animations: MeleeAnimationsFolder;
}

interface GunOffsetsFolder extends Folder {
  Main: CFrameValue;
  Aim: CFrameValue;
  Gun: CFrameValue;
}

interface GunAnimationsFolder extends CommonAnimationsFolder {

}

interface GunModel extends Model {
  Data: ModuleScript;
  Offsets: GunOffsetsFolder;
  Animations: GunAnimationsFolder;
  Bolt: BasePart;
  Mag: BasePart;
  Handle: BasePart & {
    Fire: Sound;
    Equip: Sound;
  };
}