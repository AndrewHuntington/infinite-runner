import Phaser from "phaser";
import TextureKeys from "~/consts/TextureKeys";
import AnimationKeys from "~/consts/AnimationKeys";

export default class RocketMouse extends Phaser.GameObjects.Container {
  private flames: Phaser.GameObjects.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private mouse: Phaser.GameObjects.Sprite;

  enableJetpack(enabled: boolean) {
    this.flames.setVisible(enabled);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // create the Rocket Mouse sprite
    this.mouse = scene.add
      .sprite(0, 0, TextureKeys.RocketMouse)
      .setOrigin(0.5, 1)
      .play(AnimationKeys.RocketMouseRun);

    // create the flames and play the animation
    this.flames = scene.add
      .sprite(-63, -15, TextureKeys.RocketMouse)
      .play(AnimationKeys.RocketFlamesOn);

    this.enableJetpack(false);
    this.add(this.flames);

    // add as child of Container
    this.add(this.mouse);

    // add a physics body
    scene.physics.add.existing(this);

    // adjust physics body and offset
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.mouse.width, this.mouse.height);
    body.setOffset(this.mouse.width * -0.5, -this.mouse.height);

    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  preUpdate() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // check if is space bar down
    if (this.cursors.space?.isDown) {
      body.setAccelerationY(-600);
      this.enableJetpack(true);

      this.mouse.play(AnimationKeys.RocketMouseFly, true);
    } else {
      body.setAccelerationY(0);
      this.enableJetpack(false);
    }

    // check if touching the ground
    if (body.blocked.down) {
      // play run when touching the ground
      this.mouse.play(AnimationKeys.RocketMouseRun, true);
    } else if (body.velocity.y > 0) {
      // play fall when no longer ascending
      this.mouse.play(AnimationKeys.RocketMouseFall, true);
    }
  }
}
