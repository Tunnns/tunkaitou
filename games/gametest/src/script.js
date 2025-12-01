class MainScene extends Phaser.Scene{
constructor(){super();this._0xhit=!1;this._0xtoggle=null;}
preload(){this.load.spritesheet("p1_idle","assets/player1/Idle.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p1_walk","assets/player1/Walk.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p1_jump","assets/player1/Jump.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p1_hurt","assets/player1/Hurt.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p1_knock","assets/player1/knockback.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p1_dead","assets/player1/Dead.png",{frameWidth:128,frameHeight:128});for(let i=1;i<=4;i++){this.load.spritesheet(`p1_attack${i}`,`assets/player1/Attack_${i}.png`,{frameWidth:128,frameHeight:128})}this.load.audio("p1_slash","assets/player1/sounds/slash_1.mp3");this.load.audio("p1_prepare","assets/player1/sounds/prepare.mp3");this.load.audio("p1_blast","assets/player1/sounds/blast.mp3");this.load.audio("p1_jump","assets/player1/sounds/jump.mp3");this.load.audio("p1_hurt","assets/player1/sounds/hurt_1.mp3");
this.load.spritesheet("p2_idle","assets/player2/Idle.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p2_walk","assets/player2/Walk.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p2_jump","assets/player2/Jump.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p2_hurt","assets/player2/Hurt.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p2_knock","assets/player2/knockback.png",{frameWidth:128,frameHeight:128});this.load.spritesheet("p2_dead","assets/player2/Dead.png",{frameWidth:128,frameHeight:128});for(let i=1;i<=4;i++){this.load.spritesheet(`p2_attack${i}`,`assets/player2/Attack_${i}.png`,{frameWidth:128,frameHeight:128})}this.load.audio("p2_slash","assets/player2/sounds/slash_2.mp3");this.load.audio("p2_hurt","assets/player2/sounds/hurt_2.mp3");}
create(){const _0xgY=464;this.add.graphics().fillStyle(0x444444,1).fillRect(0,_0xgY,800,32);const _0xground=this.physics.add.staticGroup();_0xground.create(400,_0xgY+16).setDisplaySize(800,32).refreshBody();
this._0xhit=!1;this._0xtoggle=this.input.keyboard.addKey('H');
this._0xanim("p1");this._0xanim("p2");
this._0xplayer("p1",300,_0xground);this._0xplayer("p2",500,_0xground);
this.physics.add.overlap(this.p1AttackBox,this.p2BodyBox,()=>{if(this.p1State.isAttacking&&!this.p1State.hasHit&&!this.p2State.isBeingHit){this.p1State.hasHit=!0;this._0xhitEnemy("p2","p1");this._0xflash(this.p1AttackBox,0xff00ff);this._0xflash(this.p2BodyBox,0xff0000);}});
this.physics.add.overlap(this.p2AttackBox,this.p1BodyBox,()=>{if(this.p2State.isAttacking&&!this.p2State.hasHit&&!this.p1State.isBeingHit){this.p2State.hasHit=!0;this._0xhitEnemy("p1","p2");this._0xflash(this.p2AttackBox,0x00ff00);this._0xflash(this.p1BodyBox,0xffff00);}});}
_0xflash(r,c){let o=r.fillColor;r.setFillStyle(c,0.5);this.time.delayedCall(200,()=>r.setFillStyle(o,0.5));}
_0xplayer(p,x,g){let pl=this.physics.add.sprite(x,400,`${p}_idle`).play(`${p}_idle`);pl.setCollideWorldBounds(!0);this.physics.add.collider(pl,g);
let b=this.add.rectangle(0,0,60,70,0x00ff00,0.5).setOrigin(0.5);this.physics.add.existing(b);b.body.allowGravity=!1;
let a=this.add.rectangle(0,0,80,40,0xffff00,0.5).setOrigin(0.5);this.physics.add.existing(a);a.body.enable=!1;a.body.allowGravity=!1;
b.setVisible(this._0xhit);a.setVisible(this._0xhit);
let k=this.input.keyboard.addKeys(p==="p1"?{up:"K",left:"A",right:"D",attack:"J"}:{up:Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,left:Phaser.Input.Keyboard.KeyCodes.LEFT,right:Phaser.Input.Keyboard.KeyCodes.RIGHT,attack:Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE});
let s=p==="p1"?{jump:this.sound.add("p1_jump"),slash:this.sound.add("p1_slash"),prepare:this.sound.add("p1_prepare"),blast:this.sound.add("p1_blast"),hurt:this.sound.add("p1_hurt")}:{jump:this.sound.add("p1_jump"),slash:this.sound.add("p2_slash"),hurt:this.sound.add("p2_hurt")};
let st={isAttacking:!1,hasHit:!1,attackCooldown:!1,isBeingHit:!1,isDead:!1,isKnockback:!1,attackStage:1,currentAttackStage:0,lastHitStage:0,comboHitCount:0,attackTimer:null,hp:100};
pl.on("animationcomplete",anim=>{if(anim.key.startsWith(`${p}_attack`)){this.time.delayedCall(100,()=>{st.isAttacking=!1;st.attackCooldown=!1;st.hasHit=!1;});if(st.attackTimer)st.attackTimer.remove();st.attackTimer=this.time.delayedCall(1000,()=>{st.attackStage=1;st.currentAttackStage=0;});a.body.enable=!1;}});
this[p]=pl;this[`${p}BodyBox`]=b;this[`${p}AttackBox`]=a;this[`${p}State`]=st;this[`keys${p.toUpperCase()}`]=k;this[`${p}_sounds`]=s;}
update(){if(Phaser.Input.Keyboard.JustDown(this._0xtoggle)){this._0xhit=!this._0xhit;[this.p1BodyBox,this.p1AttackBox,this.p2BodyBox,this.p2AttackBox].forEach(r=>r.setVisible(this._0xhit));}
["p1","p2"].forEach((p,i)=>{let pl=this[p],k=this[`keys${p.toUpperCase()}`],st=this[`${p}State`],a=this[`${p}AttackBox`],b=this[`${p}BodyBox`],s=this[`${p}_sounds`],op=this[i===0?"p2":"p1"];
b.x=pl.x;b.y=pl.y+25;a.x=pl.x+(pl.flipX?-10:10);a.y=pl.y+10;if(st.isBeingHit||st.isDead||st.isKnockback)return;
let sp=200,L=k.left.isDown,R=k.right.isDown;if(!st.isAttacking&&!st.attackCooldown){if(L){pl.setVelocityX(-sp);pl.setFlipX(!0);}else if(R){pl.setVelocityX(sp);pl.setFlipX(!1);}else pl.setVelocityX(0);
if(k.up.isDown&&pl.body.blocked.down){s.jump?.play();pl.setVelocityY(-350);}
if(Phaser.Input.Keyboard.JustDown(k.attack)){let atk=st.attackStage,atkKey=`${p}_attack${atk}`;if(this.anims.exists(atkKey))pl.play(atkKey,!0);
st.currentAttackStage=atk;pl.setVelocityX(0);pl.setFlipX(pl.x>op.x);pl.x+=20*(pl.flipX?-1:1);
let act=()=>{a.body.enable=!0;this.time.delayedCall(250,()=>{a.body.enable=!1;});};
if(atk===4&&s.prepare&&s.blast){s.prepare.play();this.time.delayedCall(400,()=>{s.blast.play();act();});}else{if(atk===1)this.time.delayedCall(250,()=>s.slash?.play());else s.slash?.play();act();}
st.isAttacking=!0;st.attackCooldown=!0;st.hasHit=!1;st.attackStage++;if(st.attackStage>4)st.attackStage=1;}}
if(!st.isAttacking){if(!pl.body.blocked.down)pl.play(`${p}_jump`,!0);else if(pl.body.velocity.x!==0)pl.play(`${p}_walk`,!0);else pl.play(`${p}_idle`,!0);}});}
_0xhitEnemy(t,a){let tg=this[t],ts=this[`${t}State`],at=this[a],as=this[`${a}State`],stg=as.currentAttackStage;if(ts.isBeingHit||ts.isDead||ts.isKnockback||!stg)return;
tg.setFlipX(tg.x>at.x);ts.isBeingHit=!0;this[`${t}_sounds`]?.hurt?.play();
let ex=(ts.lastHitStage||0)+1;ts.comboHitCount=stg===ex?(ts.comboHitCount||1)+1:1;ts.lastHitStage=stg;
let dir=tg.x<at.x?-1:1;if(ts.comboHitCount>=4){tg.setVelocityY(-400);tg.x+=dir*100;tg.play(`${t}_knock`,!0);ts.comboHitCount=0;ts.lastHitStage=0;ts.isKnockback=!0;this.time.delayedCall(1000,()=>{ts.isKnockback=!1;ts.isBeingHit=!1;});}
else{tg.x+=dir*30;if(ts.hp<=0){ts.isDead=!0;tg.setVelocity(0,0);tg.play(`${t}_dead`,!0);}
else{tg.play(`${t}_hurt`,!0);this.time.delayedCall(600,()=>{if(!ts.isDead)ts.isBeingHit=!1;});}}}
_0xanim(p){this.anims.create({key:`${p}_idle`,frames:this.anims.generateFrameNumbers(`${p}_idle`,{start:0,end:5}),frameRate:4,repeat:-1});
this.anims.create({key:`${p}_walk`,frames:this.anims.generateFrameNumbers(`${p}_walk`,{start:0,end:5}),frameRate:7,repeat:-1});
this.anims.create({key:`${p}_jump`,frames:this.anims.generateFrameNumbers(`${p}_jump`,{start:0,end:5}),frameRate:8,repeat:-1});
this.anims.create({key:`${p}_hurt`,frames:this.anims.generateFrameNumbers(`${p}_hurt`,{start:0,end:2}),frameRate:8,repeat:0});
this.anims.create({key:`${p}_knock`,frames:this.anims.generateFrameNumbers(`${p}_knock`,{start:0,end:5}),frameRate:8,repeat:0});
this.anims.create({key:`${p}_dead`,frames:this.anims.generateFrameNumbers(`${p}_dead`,{start:0,end:5}),frameRate:8,repeat:0});
for(let i=1;i<=3;i++){this.anims.create({key:`${p}_attack${i}`,frames:this.anims.generateFrameNumbers(`${p}_attack${i}`,{start:0,end:5}),frameRate:12,repeat:0});}
this.anims.create({key:`${p}_attack4`,frames:this.anims.generateFrameNumbers(`${p}_attack4`,{start:0,end:10}),frameRate:14,repeat:0});}}
const config={type:Phaser.AUTO,width:800,height:600,backgroundColor:"#1d1d1d",physics:{default:"arcade",arcade:{gravity:{y:800},debug:!1}},scene:MainScene};
new Phaser.Game(config);
