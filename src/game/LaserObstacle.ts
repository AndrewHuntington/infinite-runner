import { BodyFactory } from "matter";
import Phaser, { Scene } from "phaser";
import TextureKeys from "~/consts/TextureKeys";

export default class LaserObstacle extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // create a top
    const top = scene.add.image(0, 0, TextureKeys.LaserEnd).setOrigin(0.5, 0);

    // create a middle and set it below top
    const middle = scene.add
      .image(0, top.y + top.displayHeight, TextureKeys.LaserMiddle)
      .setOrigin(0.5, 0);

    // set height of middle laser to 200px
    middle.setDisplaySize(middle.width, 200);

    // create a bottom that is flipped and below the middle
    const bottom = scene.add
      .image(0, middle.y + middle.displayHeight, TextureKeys.LaserEnd)
      .setOrigin(0.5, 0)
      .setFlipY(true);

    // add them all to the Container
    this.add(top);
    this.add(middle);
    this.add(bottom);

    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    const width = top.displayWidth;
    const height =
      top.displayHeight + middle.displayHeight + bottom.displayHeight;

    body.setSize(width * 0.5, height);
    // ! no matter what value I use, the y offset doesn't change
    body.setOffset(-width * 0.25, 0);

    // reposition body
    body.position.x = this.x + body.offset.x;
    body.position.y = this.y;
  }
}
