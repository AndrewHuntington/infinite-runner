import Phaser from "phaser";
import TextureKeys from "~/consts/TextureKeys";
import SceneKeys from "~/consts/SceneKeys";
import AnimationKeys from "~/consts/AnimationKeys";
import RocketMouse from "~/game/RocketMouse";
import LaserObstacle from "~/game/LaserObstacle";

export default class Game extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private mouseHole!: Phaser.GameObjects.Image;
  private window1!: Phaser.GameObjects.Image;
  private window2!: Phaser.GameObjects.Image;
  private bookcase1!: Phaser.GameObjects.Image;
  private bookcase2!: Phaser.GameObjects.Image;
  private bookcases: Phaser.GameObjects.Image[] = [];
  private windows: Phaser.GameObjects.Image[] = [];
  private laserObstacle!: LaserObstacle;
  private mouse!: RocketMouse;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private scoreLabel!: Phaser.GameObjects.Text;
  private score = 0;

  constructor() {
    super(SceneKeys.Game);
  }

  // Determines when the mouseHole scrolls off the left side of the screen
  // and gives it a new position ahead of Rocket Mouse
  private wrapMouseHole() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    if (this.mouseHole.x + this.mouseHole.width < scrollX) {
      this.mouseHole.x = Phaser.Math.Between(rightEdge + 100, rightEdge + 1000);
    }
  }

  private wrapWindows() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // multiply by 2 to add some more padding
    let width = this.window1.width * 2;

    if (this.window1.x + width < scrollX) {
      this.window1.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 800
      );

      // use find() to look for a bookcase that overlaps
      // with the new window position
      const overlap = this.bookcases.find((bc) => {
        return Math.abs(this.window1.x - bc.x) <= this.window1.width;
      });

      // then set visible to true if there is no overlap
      // false if there is an overlap
      this.window1.visible = !overlap;
    }

    width = this.window2.width * 2;
    if (this.window2.x + width < scrollX) {
      this.window2.x = Phaser.Math.Between(
        this.window1.x + width,
        this.window1.x + width + 800
      );

      // do the same thing for window2
      const overlap = this.bookcases.find((bc) => {
        return Math.abs(this.window2.x - bc.x) <= this.window2.width;
      });

      this.window2.visible = !overlap;
    }
  }

  private wrapBookcases() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    let width = this.bookcase1.width * 2;
    if (this.bookcase1.x + width < scrollX) {
      this.bookcase1.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 800
      );

      // use find() to look for a window that overlaps
      // with the new bookcase position
      const overlap = this.windows.find((win) => {
        return Math.abs(this.bookcase1.x - win.x) <= this.bookcase1.width;
      });

      // then set visible to true if there is no overlap
      // false if there is an overlap
      this.bookcase1.visible = !overlap;
    }

    width = this.bookcase2.width * 2;
    if (this.bookcase2.x + width < scrollX) {
      this.bookcase2.x = Phaser.Math.Between(
        this.bookcase1.x + width,
        this.bookcase1.x + width + 800
      );

      const overlap = this.windows.find((win) => {
        return Math.abs(this.bookcase2.x - win.x) <= this.bookcase2.width;
      });

      this.bookcase2.visible = !overlap;

      this.spawnCoins();
    }
  }

  private wrapLaserObstacle() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // body variable with specific physic body type
    const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody;

    const width = body.width;
    if (this.laserObstacle.x + width < scrollX) {
      this.laserObstacle.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge + width + 1000
      );
      this.laserObstacle.y = Phaser.Math.Between(0, 100);

      // set the physics body's position
      // add body.offset.x to account for x offset

      body.position.x = this.laserObstacle.x + body.offset.x;
      body.position.y = this.laserObstacle.y;
    }
  }

  private handleOverlapLaser(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    this.mouse.kill();
  }

  private spawnCoins() {
    // make sure all coins are inactive and hidden
    this.coins.children.each((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      this.coins.killAndHide(coin);
      coin.body.enable = false;
    });

    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    // start at 100 pixels past the right side of the screen
    let x = rightEdge + 100;

    // get a random number between 1 and 20
    const numCoins = Phaser.Math.Between(1, 20);

    // the coins based on random number
    for (let i = 0; i < numCoins; ++i) {
      const coin = this.coins.get(
        x,
        Phaser.Math.Between(100, this.scale.height - 100),
        TextureKeys.Coin
      ) as Phaser.Physics.Arcade.Sprite;

      // make sure coin is visible and active
      coin.setVisible(true);
      coin.setActive(true);

      // enable and adjust physics body to be a circle
      const body = coin.body as Phaser.Physics.Arcade.StaticBody;
      body.setCircle(body.width * 0.5);
      body.enable = true;

      // update the body x, y position from the GameObject
      body.updateFromGameObject();

      // move x a random amount
      x += coin.width * 1.5;
    }
  }

  private handleCollectCoin(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    // obj will be the coin
    const coin = obj2 as Phaser.Physics.Arcade.Sprite;

    // use the group to hide it
    this.coins.killAndHide(coin);

    // and turn off the physics body
    coin.body.enable = false;

    this.score += 1;

    this.scoreLabel.text = `Score: ${this.score}`;
  }

  init() {
    this.score = 0;
  }

  create() {
    // store the width and height of the game screen
    const width = this.scale.width;
    const height = this.scale.height;

    // create background TitleSprite
    this.background = this.add
      .tileSprite(0, 0, width, height, TextureKeys.Background)
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);

    /**
     * Create house decorations
     */
    // create the mouse hole
    this.mouseHole = this.add.image(
      Phaser.Math.Between(900, 1500), // x value
      501, // y value
      TextureKeys.MouseHole
    );

    // create windows
    this.window1 = this.add.image(
      Phaser.Math.Between(900, 1300),
      200,
      TextureKeys.Window1
    );

    this.window2 = this.add.image(
      Phaser.Math.Between(1600, 2000),
      200,
      TextureKeys.Window2
    );

    this.windows = [this.window1, this.window2];

    // create bookcases
    this.bookcase1 = this.add
      .image(Phaser.Math.Between(2200, 2700), 580, TextureKeys.Bookcase1)
      .setOrigin(0.5, 1);

    this.bookcase2 = this.add
      .image(Phaser.Math.Between(2900, 3400), 580, TextureKeys.Bookcase2)
      .setOrigin(0.5, 1);

    this.bookcases = [this.bookcase1, this.bookcase2];

    /**
     * Create laser obstacle
     */
    this.laserObstacle = new LaserObstacle(this, 900, 100);
    this.add.existing(this.laserObstacle);

    /**
     * Create coins group
     */
    this.coins = this.physics.add.staticGroup();
    this.spawnCoins();

    /**
     * Create mouse character
     */
    this.mouse = new RocketMouse(this, width * 0.5, height - 30);
    this.add.existing(this.mouse);

    const body = this.mouse.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setVelocityX(200);

    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height - 55);

    this.cameras.main.startFollow(this.mouse);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

    this.physics.add.overlap(
      this.laserObstacle,
      this.mouse,
      this.handleOverlapLaser,
      undefined,
      this
    );

    // create overlap detection
    this.physics.add.overlap(
      this.coins,
      this.mouse,
      this.handleCollectCoin,
      undefined,
      this
    );

    this.scoreLabel = this.add
      .text(10, 10, `Score: ${this.score}`, {
        fontSize: "24px",
        color: "#080808",
        backgroundColor: "#F8E71C",
        shadow: { fill: true, blur: 0, offsetY: 0 },
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
      })
      .setScrollFactor(0);
  }

  /**
   * @param  {number} t  - The total time elapsed since the game started.
   * @param  {number} dt - The time elapsed since the last update.
   */
  update(t: number, dt: number) {
    this.wrapMouseHole();
    this.wrapWindows();
    this.wrapBookcases();
    this.wrapLaserObstacle();
    this.background.setTilePosition(this.cameras.main.scrollX);
  }
}
