import Phaser from "phaser";
import TextureKeys from "~/consts/TextureKeys";
import SceneKeys from "~/consts/SceneKeys";
import AnimationKeys from "~/consts/AnimationKeys";

export default class Game extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super(SceneKeys.Game);
  }

  create() {
    // store the width and height of the game screen
    const width = this.scale.width;
    const height = this.scale.height;

    this.background = this.add
      .tileSprite(0, 0, width, height, TextureKeys.Background)
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);

    const mouse = this.physics.add
      .sprite(
        width * 0.5,
        height - 30, // set y to top of the floor
        TextureKeys.RocketMouse,
        "rocketmouse_fly01.png"
      )
      .setOrigin(0.5, 1) // set origin to feet
      .play(AnimationKeys.RocketMouseRun);

    const body = mouse.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    body.setVelocityX(200);

    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height - 30);

    this.cameras.main.startFollow(mouse);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);
  }

  /**
   * @param  {number} t  - The total time elapsed since the game started.
   * @param  {number} dt - The time elapsed since the last update.
   */
  update(t: number, dt: number) {
    this.background.setTilePosition(this.cameras.main.scrollX);
  }
}
