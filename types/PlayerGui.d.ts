interface PlayerGui extends BasePlayerGui {
  HUD: ScreenGui & {
    Ammo: Frame & {
      Reserve: TextLabel;
      UIPadding: UIPadding;
      Firemode: TextLabel;
      Mag: TextLabel;
      UIStroke: UIStroke;
      UICorner: UICorner;
      MagSize: TextLabel;
    };
    UIPadding: UIPadding;
    Health: Frame & {
      UICorner: UICorner;
      UIStroke: UIStroke;
      Display: TextLabel;
      Bar: Frame & {
        UICorner: UICorner;
      };
    };
  };
}