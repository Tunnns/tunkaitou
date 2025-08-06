class MainScene extends Phaser.Scene {
  preload() { // Tải tài nguyên
    // Player 1
    this.load.spritesheet("p1_idle", "assets/player1/Idle.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p1_walk", "assets/player1/Walk.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p1_jump", "assets/player1/Jump.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p1_hurt", "assets/player1/Hurt.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p1_knock", "assets/player1/knockback.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p1_dead", "assets/player1/Dead.png", { frameWidth: 128, frameHeight: 128 });
    for (let i = 1; i <= 4; i++) {
      this.load.spritesheet(`p1_attack${i}`, `assets/player1/Attack_${i}.png`, { frameWidth: 128, frameHeight: 128 });
    }
    this.load.audio("p1_slash", "assets/player1/sounds/slash_1.mp3");
    this.load.audio("p1_prepare", "assets/player1/sounds/prepare.mp3");
    this.load.audio("p1_blast", "assets/player1/sounds/blast.mp3");
    this.load.audio("p1_jump", "assets/player1/sounds/jump.mp3");
    this.load.audio("p1_hurt", "assets/player1/sounds/hurt_1.mp3");

    // Player 2
    this.load.spritesheet("p2_idle", "assets/player2/Idle.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p2_walk", "assets/player2/Walk.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p2_jump", "assets/player2/Jump.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p2_hurt", "assets/player2/Hurt.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p2_knock", "assets/player2/knockback.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("p2_dead", "assets/player2/Dead.png", { frameWidth: 128, frameHeight: 128 });
    for (let i = 1; i <= 4; i++) {
      this.load.spritesheet(`p2_attack${i}`, `assets/player2/Attack_${i}.png`, { frameWidth: 128, frameHeight: 128 });
    }
    this.load.audio("p2_slash", "assets/player2/sounds/slash_2.mp3");
    this.load.audio("p2_hurt", "assets/player2/sounds/hurt_2.mp3");
  }

  create() { // Tạo scene
    const groundY = 464;
    this.add.graphics().fillStyle(0x444444, 1).fillRect(0, groundY, 800, 32);
    const ground = this.physics.add.staticGroup();
    ground.create(400, groundY + 16).setDisplaySize(800, 32).refreshBody();

    // Hitbox mặc định ẩn
    this.showHitbox = false;
    this.toggleKey = this.input.keyboard.addKey('H');

    this.createAnimations("p1");
    this.createAnimations("p2");

    this.createPlayer("p1", 300, ground);
    this.createPlayer("p2", 500, ground);

    // Overlap xử lý đánh trúng
    this.physics.add.overlap(this.p1AttackBox, this.p2BodyBox, () => {
      if (this.p1State.isAttacking && !this.p1State.hasHit && !this.p2State.isBeingHit) {
        this.p1State.hasHit = true;
        this.handleHit("p2", "p1");
        this.flashHitbox(this.p1AttackBox, 0x00ff00); // xanh lá khi đánh trúng
        this.flashHitbox(this.p2BodyBox, 0xffff00);   // vàng khi bị đánh
      }
    });

    this.physics.add.overlap(this.p2AttackBox, this.p1BodyBox, () => {
      if (this.p2State.isAttacking && !this.p2State.hasHit && !this.p1State.isBeingHit) {
        this.p2State.hasHit = true;
        this.handleHit("p1", "p2");
        this.flashHitbox(this.p2AttackBox, 0x00ff00);
        this.flashHitbox(this.p1BodyBox, 0xffff00);
      }
    });
  }

  flashHitbox(rect, color) {
    const oldColor = rect.fillColor;
    rect.setFillStyle(color, 0.5);
    this.time.delayedCall(200, () => rect.setFillStyle(oldColor, 0.5));
  }

  createPlayer(prefix, x, ground) {
    const player = this.physics.add.sprite(x, 400, `${prefix}_idle`).play(`${prefix}_idle`);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, ground);

    // BodyBox: tím
    const bodyBox = this.add.rectangle(0, 0, 60, 70, 0xff00ff, 0.5).setOrigin(0.5);
    this.physics.add.existing(bodyBox);
    bodyBox.body.allowGravity = false;

    // AttackBox: đỏ
    const attackBox = this.add.rectangle(0, 0, 80, 40, 0xff0000, 0.5).setOrigin(0.5);
    this.physics.add.existing(attackBox);
    attackBox.body.enable = false;
    attackBox.body.allowGravity = false;

    // Mặc định ẩn hitbox
    bodyBox.setVisible(this.showHitbox);
    attackBox.setVisible(this.showHitbox);

    const keys = this.input.keyboard.addKeys(prefix === "p1"
      ? { up: "K", left: "A", right: "D", attack: "J" }
      : {
        up: Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        attack: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE
      });

    const sounds = prefix === "p1"
      ? {
          jump: this.sound.add("p1_jump"),
          slash: this.sound.add("p1_slash"),
          prepare: this.sound.add("p1_prepare"),
          blast: this.sound.add("p1_blast"),
          hurt: this.sound.add("p1_hurt")
        }
      : {
          jump: this.sound.add("p1_jump"),
          slash: this.sound.add("p2_slash"),
          hurt: this.sound.add("p2_hurt")
        };

    const state = {
      isAttacking: false,
      hasHit: false,
      attackCooldown: false,
      isBeingHit: false,
      isDead: false,
      isKnockback: false,
      attackStage: 1,
      currentAttackStage: 0,
      lastHitStage: 0,
      comboHitCount: 0,
      attackTimer: null,
      hp: 100
    };

    player.on("animationcomplete", (anim) => {
      if (anim.key.startsWith(`${prefix}_attack`)) {
        this.time.delayedCall(100, () => {
          state.isAttacking = false;
          state.attackCooldown = false;
          state.hasHit = false;
        });
        if (state.attackTimer) state.attackTimer.remove();
        state.attackTimer = this.time.delayedCall(1000, () => {
          state.attackStage = 1;
          state.currentAttackStage = 0;
        });
        attackBox.body.enable = false;
      }
    });

    this[prefix] = player;
    this[`${prefix}BodyBox`] = bodyBox;
    this[`${prefix}AttackBox`] = attackBox;
    this[`${prefix}State`] = state;
    this[`keys${prefix.toUpperCase()}`] = keys;
    this[`${prefix}_sounds`] = sounds;
  }

  update() {
    // Toggle hitbox bằng phím H
    if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
      this.showHitbox = !this.showHitbox;
      this.p1BodyBox.setVisible(this.showHitbox);
      this.p1AttackBox.setVisible(this.showHitbox);
      this.p2BodyBox.setVisible(this.showHitbox);
      this.p2AttackBox.setVisible(this.showHitbox);
    }

    ["p1", "p2"].forEach((prefix, i) => {
      const player = this[prefix];
      const keys = this[`keys${prefix.toUpperCase()}`];
      const state = this[`${prefix}State`];
      const attackBox = this[`${prefix}AttackBox`];
      const bodyBox = this[`${prefix}BodyBox`];
      const sounds = this[`${prefix}_sounds`];
      const opponent = this[i === 0 ? "p2" : "p1"];

      // Update vị trí hitbox
      bodyBox.x = player.x;
      bodyBox.y = player.y + 25;
      attackBox.x = player.x + (player.flipX ? -20 : 20);
      attackBox.y = player.y + 10;

      if (state.isBeingHit || state.isDead || state.isKnockback) return;

      const speed = 200;
      const isMovingLeft = keys.left.isDown;
      const isMovingRight = keys.right.isDown;

      if (!state.isAttacking && !state.attackCooldown) {
        if (isMovingLeft) {
          player.setVelocityX(-speed);
          player.setFlipX(true);
        } else if (isMovingRight) {
          player.setVelocityX(speed);
          player.setFlipX(false);
        } else {
          player.setVelocityX(0);
        }

        if (keys.up.isDown && player.body.blocked.down) {
          sounds.jump?.play();
          player.setVelocityY(-350);
        }

        if (Phaser.Input.Keyboard.JustDown(keys.attack)) {
          const atk = state.attackStage;
          const atkKey = `${prefix}_attack${atk}`;
          if (this.anims.exists(atkKey)) player.play(atkKey, true);

          state.currentAttackStage = atk;
          player.setVelocityX(0);

          const shouldFlip = player.x > opponent.x;
          player.setFlipX(shouldFlip);

          const direction = player.flipX ? -1 : 1;
          player.x += 20 * direction;

          const activateHitbox = () => {
            attackBox.body.enable = true;
            this.time.delayedCall(250, () => {
              attackBox.body.enable = false;
            });
          };

          if (atk === 4 && sounds.prepare && sounds.blast) {
            sounds.prepare.play();
            this.time.delayedCall(400, () => {
              sounds.blast.play();
              activateHitbox();
            });
          } else {
            if (atk === 1) this.time.delayedCall(250, () => sounds.slash?.play());
            else sounds.slash?.play();
            activateHitbox();
          }

          state.isAttacking = true;
          state.attackCooldown = true;
          state.hasHit = false;
          state.attackStage++;
          if (state.attackStage > 4) state.attackStage = 1;
        }
      }

      if (!state.isAttacking) {
        if (!player.body.blocked.down) player.play(`${prefix}_jump`, true);
        else if (player.body.velocity.x !== 0) player.play(`${prefix}_walk`, true);
        else player.play(`${prefix}_idle`, true);
      }
    });
  }

  handleHit(targetKey, attackerKey) {
    const target = this[targetKey];
    const targetState = this[`${targetKey}State`];
    const attacker = this[attackerKey];
    const attackerState = this[`${attackerKey}State`];
    const attackerStage = attackerState.currentAttackStage;

    if (targetState.isBeingHit || targetState.isDead || targetState.isKnockback || !attackerStage) return;

    target.setFlipX(target.x > attacker.x);
    targetState.isBeingHit = true;
    this[`${targetKey}_sounds`]?.hurt?.play();

    const expectedStage = (targetState.lastHitStage || 0) + 1;
    targetState.comboHitCount = attackerStage === expectedStage
      ? (targetState.comboHitCount || 1) + 1
      : 1;
    targetState.lastHitStage = attackerStage;

    const direction = target.x < attacker.x ? -1 : 1;

    if (targetState.comboHitCount >= 4) {
      target.setVelocityY(-400);
      target.x += direction * 100;
      target.play(`${targetKey}_knock`, true);

      targetState.comboHitCount = 0;
      targetState.lastHitStage = 0;
      targetState.isKnockback = true;

      this.time.delayedCall(1000, () => {
        targetState.isKnockback = false;
        targetState.isBeingHit = false;
      });

    } else {
      target.x += direction * 30;
      if (targetState.hp <= 0) {
        targetState.isDead = true;
        target.setVelocity(0, 0);
        target.play(`${targetKey}_dead`, true);
      } else {
        target.play(`${targetKey}_hurt`, true);
        this.time.delayedCall(600, () => {
          if (!targetState.isDead) targetState.isBeingHit = false;
        });
      }
    }
  }

  createAnimations(prefix) {
    this.anims.create({ key: `${prefix}_idle`, frames: this.anims.generateFrameNumbers(`${prefix}_idle`, { start: 0, end: 5 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: `${prefix}_walk`, frames: this.anims.generateFrameNumbers(`${prefix}_walk`, { start: 0, end: 5 }), frameRate: 7, repeat: -1 });
    this.anims.create({ key: `${prefix}_jump`, frames: this.anims.generateFrameNumbers(`${prefix}_jump`, { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: `${prefix}_hurt`, frames: this.anims.generateFrameNumbers(`${prefix}_hurt`, { start: 0, end: 2 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: `${prefix}_knock`, frames: this.anims.generateFrameNumbers(`${prefix}_knock`, { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: `${prefix}_dead`, frames: this.anims.generateFrameNumbers(`${prefix}_dead`, { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
    for (let i = 1; i <= 3; i++) {
      this.anims.create({ key: `${prefix}_attack${i}`, frames: this.anims.generateFrameNumbers(`${prefix}_attack${i}`, { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    }
    this.anims.create({ key: `${prefix}_attack4`, frames: this.anims.generateFrameNumbers(`${prefix}_attack4`, { start: 0, end: 10 }), frameRate: 14, repeat: 0 });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  physics: { default: "arcade", arcade: { gravity: { y: 800 }, debug: false } },
  scene: MainScene
};

new Phaser.Game(config);
