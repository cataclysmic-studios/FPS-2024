type ArmsName = ExtractKeys<ReplicatedFirst["Assets"]["Character"]["Arms"], ArmsModel>;
type GunName = ExtractKeys<ReplicatedFirst["Assets"]["Guns"], GunModel>;
type MeleeName = ExtractKeys<ReplicatedFirst["Assets"]["Melees"], MeleeModel>;

interface ArmsModel extends Model {
  Mesh: & {
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
  Data: ModuleScript;
  Offsets: GunOffsetsFolder;
  Bolt: BasePart;
  Mag: BasePart;
  Handle: BasePart;
}