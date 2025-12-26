// =================== Canvas (Khởi tạo màn hình game) ====================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
let paused = false; // mặc định là không tạm dừng

// =========================== Inputs (Bàn phím + chuột) ==============================
// keys[] dùng để lưu trạng thái phím đang được giữ (true/false)
// mouse lưu vị trí chuột và trạng thái nhấn giữ, trạng thái chuột phải
let keys = {};
let mouse = { x: W / 2, y: H / 2, down: false, rightDown: false, autoRight: false };

// Lắng nghe phím bấm
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Theo dõi vị trí chuột trong canvas
canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});

// Chuột bấm / nhả
canvas.addEventListener("mousedown", () => mouse.down = true);
window.addEventListener("mouseup", () => mouse.down = false);

// Hiển thị nút kỹ năng tank
const skillKeys = ["R", "E", "SPACE", "Q"];
let skillDisabled = {
    R: false,
    E: false,
    SPACE: false,
    Q: false
};
// DOM elements
const skillSlots = document.querySelectorAll(".skill-slot img");
// gán key hiển thị lên icon
skillSlots.forEach((slot, i) => {
    slot.dataset.key = skillKeys[i];
});


// ========================== MENU chọn tank ==============================
let selectedTankKey = null;

const tankData = {
    // Kaneki Ken
    kaneki: {
        speed: 180, // tốc chạy
        hp: 150, // HP
        radius: 18, // phóng to
        fireRate: 1, // tốc bắn
        damage: 15, // sát thương mỗi viên đạn
        skillIcons: [
            "src/assets/pictures/tanks/tankdautien/skill_icon/noitai.jpg",
            "src/assets/pictures/tanks/tankdautien/skill_icon/chieu1.jpg",
            "src/assets/pictures/tanks/tankdautien/skill_icon/chieu2.jpg",
            "src/assets/pictures/guild_skill/thanhtay.jpeg"
        ],
        enabledSkills: ["E", "SPACE", "Q"]  // Kaneki không có R
    },
    // Điêu Thuyền
    dieuthuyen: {
        speed: 200,
        hp: 100,
        radius: 18,
        fireRate: 0.5,
        damage: 20,
        skillIcons: [
            "src/assets/pictures/tanks/tankthu2/skill_icon/noitai.jpg",
            "src/assets/pictures/tanks/tankthu2/skill_icon/chieu1.jpg",
            "src/assets/pictures/tanks/tankthu2/skill_icon/chieu2.jpg",
            "src/assets/pictures/guild_skill/thanhtay.jpeg"
        ],
        enabledSkills: ["R", "E", "SPACE", "Q"] // Điêu thuyền có R
    }
};

const tankSelect = document.getElementById("tank-select");

document.querySelectorAll(".tank-option").forEach(el => {
    el.addEventListener("click", () => {
        selectedTankKey = el.dataset.tank; // lưu tank đã chọn
        const data = tankData[selectedTankKey];

        player = new Player(data.hp);
        player.speed = data.speed;
        player.hp = data.hp;
        player.r = data.radius;
        player.fireRate = data.fireRate; // cập nhật tốc bắn theo tank
        player.damage = data.damage; // gán sát thương

        // update icon skill
        skillSlots.forEach((slot, i) => {
            const key = skillKeys[i]; // "R","E","SPACE","Q"
            slot.src = data.skillIcons[i];

            const label = slot.parentElement.querySelector(".skill-key"); // lấy span hiển thị chữ key

            if (!data.enabledSkills.includes(key)) {
                label.style.display = "none"; // ẩn chữ key
            } else {
                label.style.display = "block"; // hiện chữ key
                label.textContent = key;
            }
        });


        // Ẩn overlay chọn tank
        tankSelect.style.display = "none";
        paused = false;
    });
});

// Khi mở game lần đầu, tạm dừng game
paused = true;
tankSelect.style.display = "flex";


// ==================================== HUD (Giao diện điểm, máu,) ======================================
const scoreEl = document.getElementById("score");
const hpEl = document.getElementById("hp");
const hpMeter = document.getElementById("hp-meter");
const scoreMeter = document.getElementById("score-meter");

const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("final-score");

// ============================ CẬP NHẬT THANH MÁU GÓC DƯỚI MÀN HÌNH ============================
function updateSmallHP(current, max) {
    const fill = document.getElementById("hp-small-fill");
    const text = document.getElementById("hp-small-text");

    if (!fill || !text) {
        console.warn("Không tìm thấy phần tử HP nhỏ!");
        return;
    }

    const percent = Math.max(0, (current / max) * 100);

    fill.style.width = percent + "%";
    text.textContent = `${current}/${max}`;
}

// ===================================== Tạm dừng game =====================================
let spawnEnabled = true;   // mặc định KHÔNG spawn quái
let allowSpawn = false;     // Num3 bật tắt chế độ spawn


// Num1 = Pause, Num2 = Toggle spawn
window.addEventListener("keydown", e => {

    // Num1: pause
    if (e.code === "Numpad1") {
        paused = !paused;

        if (paused) {
            console.log("Numpad1: Dừng game");
        } else {
            console.log("Numpad1: Bật game");
        }
    }

    // Num2: bật/tắt spawn như cũ
    if (e.code === "Numpad2") {
        spawnEnabled = !spawnEnabled;

        if (spawnEnabled) {
            console.log("Numpad2: Spawn quái BẬT");
        } else {
            console.log("Numpad2: Spawn quái TẮT");
            // enemies.length = 0; // nếu muốn tắt spawn thì xoá quái luôn
            spawnTimer = 0;      // reset timer để tránh delay khi bật lại
        }
    }

    // Num3: Clear quái
    if (e.code === "Numpad3") {
        enemies.length = 0;
        spawnTimer = 0;
        console.log("Numpad3: Đã xoá toàn bộ quái");
    }


    const key = e.key.toUpperCase();
    if ((key === "R") && !skillDisabled.R) useSkill("R");
    if ((key === "E") && !skillDisabled.E) useSkill("E");
    if ((key === " " || key === "SPACE") && !skillDisabled.SPACE) useSkill("SPACE");
    if ((key === "Q") && !skillDisabled.Q) useSkill("Q");
});

// ==================================== Player (Người chơi) ======================================
let camera = {
    x: 0,
    y: 0
};

class Player {
    constructor(hp = 100) {
        this.x = W / 2;
        this.y = H / 2;
        this.r = 18;
        this.speed = 220;
        this.hp = hp;
        this.maxHp = hp;
        this.cool = 0;
        this.fireRate = 1;

        this.headAngle = 0; // hướng di chuyển cuối cùng
    }

    update(dt) {
        let dx = 0, dy = 0;
        if (keys["w"]) dy -= 1;
        if (keys["s"]) dy += 1;
        if (keys["a"]) dx -= 1;
        if (keys["d"]) dx += 1;

        // chuẩn hóa vector
        if (dx || dy) {
            const length = Math.hypot(dx, dy);
            dx /= length; dy /= length;

            // cập nhật vị trí
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;

            // cập nhật hướng head
            this.headAngle = Math.atan2(dy, dx);
        }

        // giữ trong màn hình
        this.x = Math.max(this.r, Math.min(W - this.r, this.x));
        this.y = Math.max(this.r, Math.min(H - this.r, this.y));

        // cooldown bắn
        if (this.cool > 0) this.cool -= dt;

        // bắn chuột trái
        if (mouse.down && this.cool <= 0) {
            this.shoot();
            this.cool = this.fireRate;
        }

        // auto bắn chuột phải
        if (mouse.autoRight && this.cool <= 0) {
            this.shoot();
            this.cool = this.fireRate;
        }
    }

    shoot() {
        const ang = Math.atan2(mouse.y + camera.y - this.y, mouse.x + camera.x - this.x);
        bullets.push(
            new Bullet(
                this.x + Math.cos(ang) * this.r,
                this.y + Math.sin(ang) * this.r,
                ang,
                this.damage // truyền damage vào Bullet
            )
        );
    }

    draw(cam) {
        // --- Vẽ thân (xoay theo headAngle) ---
        const bodyW = this.r * 3;
        const bodyH = this.r * 2;
        ctx.save();
        ctx.translate(this.x - cam.x, this.y - cam.y);
        ctx.rotate(this.headAngle); // xoay body theo hướng head cuối cùng

        ctx.fillStyle = "#88f5ff";
        ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

        // nếu muốn vẽ ảnh body
        if (this.bodyImg) {
            ctx.drawImage(this.bodyImg, -bodyW / 2, -bodyH / 2, bodyW, bodyH);
        }
        ctx.restore();

        // --- Vẽ nòng súng (xoay theo chuột) ---
        ctx.save();
        ctx.translate(this.x - cam.x, this.y - cam.y);
        const gunAngle = Math.atan2(mouse.y + cam.y - this.y, mouse.x + cam.x - this.x);
        ctx.rotate(gunAngle);

        const gunW = this.r * 1.6;
        const gunH = 8;
        ctx.fillStyle = "#08202a";
        ctx.fillRect(this.r * 0.2, -gunH / 2, gunW, gunH);

        if (this.gunImg) {
            ctx.drawImage(this.gunImg, this.r * 0.2, -gunH / 2, gunW, gunH);
        }
        ctx.restore();
    }
}


// ==================================== Bullet (Đạn) ======================================
class Bullet {
    constructor(x, y, a, damage = 10) {
        this.x = x; this.y = y;
        this.a = a;       // góc bắn
        this.v = 700;     // vận tốc đạn
        this.r = 4;       // bán kính đạn
        this.life = 1.5;  // thời gian tồn tại
        this.damage = damage;
    }
    update(dt) {
        this.x += Math.cos(this.a) * this.v * dt;
        this.y += Math.sin(this.a) * this.v * dt;
        this.life -= dt;
    }

    draw(cam) {
        ctx.fillStyle = "#ffdba4";
        ctx.beginPath();
        ctx.arc(this.x - cam.x, this.y - cam.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Tự động bắn khi click chuột phải
// Chuột bấm / nhả
canvas.addEventListener("mousedown", e => {
    if (e.button === 0) mouse.down = true;      // trái
    if (e.button === 2) {                       // phải
        mouse.rightDown = true;
        mouse.autoRight = !mouse.autoRight;     // click 1 lần toggle auto bắn
    }
});
window.addEventListener("mouseup", e => {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.rightDown = false;
});

// Chặn menu chuột phải mặc định
canvas.addEventListener("contextmenu", e => e.preventDefault());


// ==================================== Enemy (Quái) ======================================
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 15 + Math.random() * 5;
        this.hp = 5 + this.r * 2;
        this.speed = 60 + Math.random() * 50;
    }

    update(dt) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
    }

    draw(cam) {
        ctx.fillStyle = "#ff8a8a";
        ctx.beginPath();
        ctx.arc(this.x - cam.x, this.y - cam.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ================================ Kỹ năng (Skill) =====================================
function useSkill(key) {
    if (!selectedTankKey) return;
    if (selectedTankKey === "kaneki" && key === "R") return; // Anti sử dụng R => kỹ năng bị động

    console.log("Kích hoạt skill", key);

    const index = skillKeys.indexOf(key);
    if (index !== -1) {
        const slot = skillSlots[index];
        slot.classList.add("active");

        setTimeout(() => {
            slot.classList.remove("active");
        }, 200);
    }

    // TODO: xử lý logic skill (damage, hiệu ứng…)
}

// ================================== DAMAGE INDICATOR ==================================
class DamageIndicator {
    constructor(x, y, text, color = "#ff4444", lifetime = 0.8) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.lifetime = lifetime; // thời gian hiện
        this.vy = -40; // tốc độ lên
        this.alpha = 1; // độ trong suốt
    }

    update(dt) {
        this.y += this.vy * dt;     // nổi lên
        this.lifetime -= dt;
        this.alpha = Math.max(0, this.lifetime / 0.8);
    }

    draw(cam) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x - cam.x, this.y - cam.y);
        ctx.restore();
    }
}

// for (let j = bullets.length - 1; j >= 0; j--) {
//     if (circleHit(e, bullets[j])) {
//         e.hp -= bullets[j].damage || 10; // mặc định 10 nếu chưa gán damage

//         // Thêm indicator
//         dmgIndicators.push(new DamageIndicator(e.x, e.y, bullets[j].damage || 10));

//         bullets.splice(j, 1);

//         if (e.hp <= 0) {
//             enemies.splice(i, 1);
//             score += 10;
//         }
//         break;
//     }
// }

// =================== Game State (Trạng thái game) =====================
let player = new Player();
let bullets = [];
let enemies = [];
let score = 0;
let dmgIndicators = []; // tạo mảng lưu damage indicators

let spawnTimer = 0;
let spawnInterval = 1.2;

// =================== Helpers (Hàm phụ) =====================

// Spawn quái từ mép màn hình
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = -20; y = Math.random() * H; }
    else if (side === 1) { x = W + 20; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = -20; }
    else { x = Math.random() * W; y = H + 20; }

    enemies.push(new Enemy(x, y));
}

// kiểm tra va chạm hình tròn
function circleHit(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy <= (a.r + b.r) * (a.r + b.r);
}

// =================== Restart (Chơi lại) =====================
document.getElementById("restart").onclick = restart;

function restart() {
    score = 0;
    enemies = [];
    bullets = [];

    if (selectedTankKey) {
        const data = tankData[selectedTankKey];
        player = new Player();
        player.speed = data.speed; // lưu speed
        player.hp = data.hp; // lưu HP
        player.maxHp = data.hp; // lưu max HP
        player.r = data.radius; // lưu kích cỡ
        player.fireRate = data.fireRate; // cập nhật tốc bắn theo tank
        player.damage = data.damage; // gán sát thương

        skillSlots.forEach((slot, i) => {
            slot.src = data.skillIcons[i];
        });
    } else {
        player = new Player(); // mặc định nếu chưa chọn
    }

    tankSelect.style.display = "flex";
    overlay.style.display = "none";
    paused = false;
}


// =================== Main Loop (Vòng lặp game) =====================
let last = 0;

function loop(t) {
    requestAnimationFrame(loop);
    const dt = (t - last) / 1000;
    last = t;

    // Giữ player ở giữa màn hình
    camera.x = player.x - W / 2;
    camera.y = player.y - H / 2;

    if (paused) return;

    ctx.clearRect(0, 0, W, H);

    // --- Cập nhật ---
    player.update(dt);

    bullets.forEach(b => b.update(dt));
    bullets = bullets.filter(b => b.life > 0);

    enemies.forEach(e => e.draw(camera));
    enemies.forEach(e => e.update(dt));
    updateSmallHP(player.hp, player.maxHp);

    // --- Xử lý va chạm ---
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; // Quái chạm player 
        if (circleHit(player, e)) {
            player.hp -= 10;
            enemies.splice(i, 1);
            if (player.hp <= 0) {
                overlay.style.display = "flex";
                finalScore.textContent = "Score: " + score;
                paused = true;
            }
            continue;
        }


        // đạn chạm quái
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (circleHit(e, bullets[j])) {
                e.hp -= bullets[j].damage;
                bullets.splice(j, 1);
                if (e.hp <= 0) {
                    enemies.splice(i, 1);
                    score += 10;
                }
                break;
            }
        }
    }

    // spawn quái theo thời gian
    spawnTimer += dt;
    if (spawnEnabled && spawnTimer > spawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
    }

    // update & draw damage indicator
    dmgIndicators.forEach(di => di.update(dt));
    dmgIndicators = dmgIndicators.filter(di => di.life > 0);
    dmgIndicators.forEach(di => di.draw(camera));

    // --- Vẽ ---
    player.draw(camera);
    bullets.forEach(b => b.draw(camera));
    enemies.forEach(e => e.draw(camera));

    // --- HUD --- 
    scoreEl.textContent = score;
    updateSmallHP(player.hp, player.maxHp);
}

requestAnimationFrame(loop);
