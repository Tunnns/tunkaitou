//////////////////////////////////////////////// SYSTEM //////////////////////////////////////////
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const healthBar1 = document.getElementById('healthBar1');
const healthBar2 = document.getElementById('healthBar2');
const manaBar1 = document.getElementById('manaBar1');
const manaBar2 = document.getElementById('manaBar2');
const gameOverMessage = document.getElementById('gameOverMessage');
const winnerMessage = document.getElementById('winnerMessage');
const gameContainer = document.getElementById('gameContainer');

let idleTimeout;
let player1PositionX = 50;
let player1PositionY = 284;
let player2PositionX = 650;
let player2PositionY = 284;
player1.style.transform = 'rotateY(0deg)';
player2.style.transform = 'rotateY(180deg)';

let player1Health = 200; // Máu
let player2Health = 200;

let player1Energy = 100; // Năng lượng
let player2Energy = 100;

const HITBOX_RANGE = 60; // Hitbox
const FINAL_ATTACK_DAMAGE = 60;  // Sát thương của Ultimate
const FINAL_ATTACK_COST = 100; // Năng lượng mất khi sử dụng Ultimate

let isPlayer1Jumping = false; 
let isPlayer2Jumping = false;

let player1Attacking = false; 
let player2Attacking = false;

let isPlayer1Blocking = false; 
let isPlayer2Blocking = false;

let keyState = {
    'a': false,
    'd': false,
    'k': false,
    's': false,
    'j': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowDown': false,
    '1': false,
    'i': false,
    '5': false,
    '2': false
};

// Hiển thị Popup
function showPopup() {
    const popup = document.getElementById('meoMeoPopup');
    popup.classList.add('show');
}

window.onclick = function(event) {
    const popup = document.getElementById('meoMeoPopup');
    if (event.target === popup) {
        popup.classList.remove('show');
    }
}

// Preload tài nguyên
function preload(resources, onComplete) {
    let loadedCount = 0; // Số tài nguyên đã tải thành công
    const totalCount = resources.length;

    resources.forEach((resource) => {
        let element;

        // Kiểm tra phần mở rộng của tệp
        if (resource.endsWith('.mp3') || resource.endsWith('.wav')) {
            element = new Audio();
        } else if (resource.endsWith('.png') || resource.endsWith('.jpg') || resource.endsWith('.jpeg')) {
            element = new Image();
        } else {
            console.warn(`Không thể tải tài nguyên không xác định: ${resource}`);
            return;
        }

        element.src = resource;

        element.onload = element.oncanplaythrough = () => {
            loadedCount++;
            console.log(`Tải thành công: ${resource}`);
            if (loadedCount === totalCount) {
                onComplete(); // Gọi hàm hoàn tất
            }
        };

        element.onerror = () => {
            console.error(`Tải tài nguyên thất bại: ${resource}`);
        };
    });

    if (resources.length === 0) {
        console.warn('Danh sách tài nguyên rỗng.');
        onComplete();
    }
}

// Danh sách tài nguyên cần preload
const resources = [
    'assets/idle/player1/idle1.png',
    'assets/idle/player2/idle1.png',
    'assets/move/player1/jump1.png',
    'assets/move/player2/jump1.png',
    'assets/attack/player1/hit1.png',
    'assets/attack/player1/hit2.png',
    'assets/attack/player2/hit1.png',
    'assets/attack/player2/hit2.png',
    'assets/hurt/player1/hurt.png',
    'assets/hurt/player2/hurt.png',
    'assets/die/player1/die.png',
    'assets/die/player2/die.png',
    'sound/ult_p1.mp3',
    'sound/ult_p2.mp3',
    'sound/hurt_p1.mp3',
    'sound/hurt_p2.mp3',
    'sound/slash_p1.mp3',
    'sound/slash_p2.mp3',
    'sound/jump1.mp3',
    'sound/jump1.mp3',
    'sound/overfly.mp3'
];

preload(resources, () => {
});

// Cập nhật thanh máu khi bị trừ
function updateHealthBar() {
    healthBar1.style.width = player1Health + 'px';
    healthBar2.style.width = player2Health + 'px';
}

// Cập nhật thanh năng lượng khi bị trừ
function updatemanaBar() {
    manaBar1.style.width = player1Energy + 'px';
    manaBar2.style.width = player2Energy + 'px';
}

// Kiểm tra va chạm giữa 2 player
// Hàm kiểm tra va chạm với phạm vi cụ thể
function checkHitbox(player1X, player1Y, player2X, player2Y, range) {
    return Math.abs(player1X - player2X) < range && Math.abs(player1Y - player2Y) < range;
}

// Kích thước của gameContainer
const gameContainerWidth = gameContainer.offsetWidth;
const gameContainerHeight = gameContainer.offsetHeight;

// Nhân vật không đi ra ngoài gameContainer
function keepPlayerInBounds(player, playerPositionX, playerPositionY) {
    if (playerPositionX < 0) {
        playerPositionX = 0;
    } else if (playerPositionX + player.offsetWidth > gameContainerWidth) {
        playerPositionX = gameContainerWidth - player.offsetWidth;
    }
    if (playerPositionY < 0) {
        playerPositionY = 0;
    } else if (playerPositionY + player.offsetHeight > gameContainerHeight) {
        playerPositionY = gameContainerHeight - player.offsetHeight;
    }

    return { playerPositionX, playerPositionY };
}

// Hồi năng lượng mỗi giây
setInterval(() => {
    if (player1Energy < 100) {
        player1Energy += 25;
    }
    if (player2Energy < 100) {
        player2Energy += 25;
    }
    updatemanaBar();
}, 1000);

const winSound = new Audio('sound/win.mp3');

// Kiểm tra khi có người 0 HP sẽ thông báo ai thắng
function checkGameOver() {
    if (player1Health <= 0) {
        triggerDieAnimation(player1Sprite, 'assets/die/player1/die.png');
        winSound.volume = 0.07;
        winSound.play()
        showGameOver("Người chơi 2 thắng!");
        showFloatingText();
        document.addEventListener('click', resetGame);
    } else if (player2Health <= 0) {
        triggerDieAnimation(player2Sprite, 'assets/die/player2/die.png');
        winSound.volume = 0.07;
        winSound.play()
        showGameOver("Người chơi 1 thắng!");
        showFloatingText();
        document.addEventListener('click', resetGame);
    }
}

function showFloatingText() {
    const floatingText = document.getElementById('floatingText');
    floatingText.style.display = 'block';
}

// Animation thua
function triggerDieAnimation(playerSprite, dieImage) {
    playerSprite.src = dieImage;
    setTimeout(() => {
        playerSprite.style.transition = 'opacity 1s';
        playerSprite.style.opacity = 0;  // Làm mờ dần nhân vật
    }, 1000); // Sau 1 giây sẽ làm nhân vật biến mất
}


// Tạo đối tượng Audio
const backgroundMusic = new Audio('sound/overfly.mp3');
// Lặp lại nhạc
backgroundMusic.loop = true;
// Điều chỉnh âm lượng nếu cần
backgroundMusic.volume = 0.1; // Giảm âm lượng xuống 50%

// Phát nhạc khi trang tải
window.addEventListener('load', () => {
    showPopup();
    // Phát nhạc
    backgroundMusic.play()
        .then(() => console.log("Nhạc nền đã bắt đầu chạy."))
        .catch(error => console.warn("Trình duyệt đã chặn nhạc tự động:", error));
});


// Giữ nhạc chạy ngay cả khi người dùng tương tác
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && backgroundMusic.paused) {
        backgroundMusic.play().catch(error => console.warn("Không thể tiếp tục phát nhạc:", error));
    }
});

////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////
/////////////// Tạo âm thanh
// Slash
const slash_P1 = new Audio('sound/slash_p1.mp3')
const slash_P2 = new Audio('sound/slash_p2.mp3')
slash_P1.volume = 0.07;
slash_P2.volume = 0.07;

// Move
const jump1 = new Audio('sound/jump1.mp3')
jump1.volume = 0.07;

// Skill
const ultimateSound = new Audio('sound/dash.mp3');
const ultimateVoice_p1 = new Audio('sound/ult_p1.mp3');
const ultimateVoice_p2 = new Audio('sound/ult_p2.mp3');
ultimateSound.volume = 0.07;
ultimateVoice_p1.volume = 0.08;
ultimateSound.volume = 0.07;
ultimateVoice_p2.volume = 0.08;

// Voice
const hurtVoice_p1 = new Audio('sound/hurt_p1.mp3');
const hurtVoice_p2 = new Audio('sound/hurt_p2.mp3');
hurtVoice_p1.volume = 0.07;
hurtVoice_p2.volume = 0.07;

///////// Bàn phím
// Key check
document.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
    handleKeyDown();
    backgroundMusic.play();
});

document.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
});

// Xử lý khi người dùng nhấn phím
function handleKeyDown() {
    if (player1Health <= 0 || player2Health <= 0) {
        return;
    }

    // Player 1 di chuyển trái phải
    if (keyState['a']) {
        player1PositionX -= 10;
        player1.style.left = player1PositionX + 'px';
        player1.style.transform = 'rotateY(180deg)';
        
    }
    if (keyState['d']) {
        player1PositionX += 10;
        player1.style.left = player1PositionX + 'px';
        player1.style.transform = 'rotateY(0deg)';
    }

    // Player 2 di chuyển trái phải
    if (keyState['ArrowLeft']) {
        player2PositionX -= 10;
        player2.style.left = player2PositionX + 'px';
        player2.style.transform = 'rotateY(180deg)';
    }
    if (keyState['ArrowRight']) {
        player2PositionX += 10;
        player2.style.left = player2PositionX + 'px';
        player2.style.transform = 'rotateY(0deg)';
    }

// Hàm Animation cho nhảy
function triggerJumpAnimation(playerSprite, jumpImage, idleImage) {
    playerSprite.src = jumpImage;
    setTimeout(() => {
        playerSprite.src = idleImage; 
    }, 300); // Thời gian chuyển hình ảnh sau nhảy (100ms)
}

// Player 1 nhảy (phím 'k')
if (keyState['k'] && !isPlayer1Jumping && !isPlayer1Blocking) {
    jump1.play()
    isPlayer1Jumping = true;
    player1.style.transition = 'top 0.3s ease-in-out';
    player1PositionY -= 150;
    player1.style.top = player1PositionY + 'px';
    triggerJumpAnimation(player1Sprite, 'assets/move/player1/jump1.png', 'assets/idle/player1/idle1.png');

    setTimeout(() => {
        player1PositionY += 150;
        player1.style.top = player1PositionY + 'px';
        isPlayer1Jumping = false;
    }, 300);
}

// Player 2 nhảy (phím '2')
if (keyState['2'] && !isPlayer2Jumping && !isPlayer2Blocking) {
    jump1.play()
    isPlayer2Jumping = true;
    player2.style.transition = 'top 0.3s ease-in-out';
    player2PositionY -= 150;
    player2.style.top = player2PositionY + 'px';
    triggerJumpAnimation(player2Sprite, 'assets/move/player2/jump1.png', 'assets/idle/player2/idle1.png');

    setTimeout(() => {
        player2PositionY += 150;
        player2.style.top = player2PositionY + 'px';
        isPlayer2Jumping = false;
    }, 300);
}


    // Player 1 chặn (phím 's')
    function updateBlockingState() {
        // Player 1 chặn khi nhấn phím 's'
        if (keyState['s']) {
            isPlayer1Blocking = true;
            console.log('Player 1 chặn');
            document.getElementById('player1Block').style.display = 'block';  // Hiển thị hình ảnh chặn
        } else {
            isPlayer1Blocking = false;
            document.getElementById('player1Block').style.display = 'none';  // Ẩn hình ảnh chặn khi không chặn
        }
        // Player 2 chặn khi nhấn phím 'ArrowDown'
        if (keyState['ArrowDown']) {
            isPlayer2Blocking = true;
            console.log('Player 2 chặn');
            document.getElementById('player2Block').style.display = 'block';  // Hiển thị hình ảnh chặn
        } else {
            isPlayer2Blocking = false;
            document.getElementById('player2Block').style.display = 'none';  // Ẩn hình ảnh chặn khi không chặn
        }
    }
    setInterval(updateBlockingState, 10);  // Kiểm tra trạng thái mỗi 10ms

        // Hàm Animation cho tấn công
function triggerAttackAnimation(playerSprite, attackImage, attackImage2, idleImage) {
    playerSprite.src = attackImage;
    setTimeout(() => {
        playerSprite.src = attackImage2;
    }, 150); // Thời gian chuyển hình ảnh tấn công thứ hai (150ms)
    setTimeout(() => {
        playerSprite.src = idleImage;
    }, 300); // Thời gian tấn công kéo dài (300ms)
}
 
function triggerHurtAnimation(playerSprite, hurtImage, hurtImage2, idleImage) {
    playerSprite.src = hurtImage; 
    setTimeout(() => {
        playerSprite.src = hurtImage2; 
    }, 50); // Thời gian chuyển hình ảnh tấn công thứ hai (50ms)
    setTimeout(() => {
        playerSprite.src = idleImage; 
    }, 300); // Thời gian hurt kéo dài (300ms)
}

 // Biến kiểm tra xem người chơi có đang di chuyển hay không
let player1Moving = false;
let player2Moving = false;


// Player 1 tấn công (phím 'j')
if (keyState['j'] && !player1Attacking && !player1Moving && !isPlayer1Blocking) {
    slash_P1.play()
    player1Attacking = true;
    if (Math.abs(player1PositionX - player2PositionX) <= HITBOX_RANGE) {
        if (player1PositionX < player2PositionX) {
            player1.style.transform = 'rotateY(0deg)';
        } else {
            player1.style.transform = 'rotateY(180deg)';
        }
    }
    triggerAttackAnimation(player1Sprite, 'assets/attack/player1/hit1.png', 'assets/attack/player1/hit2.png', 'assets/idle/player1/idle1.png');
    if (checkHitbox(player1PositionX, player1PositionY, player2PositionX, player2PositionY, HITBOX_RANGE)) {
        if (isPlayer2Blocking) {
            player2Health -= 20 * 0.2;
        } else {
            player2Health -= 20;
        }
        player1Energy += 10;
        if (player1Energy > 100) player1Energy = 100;
        hurtVoice_p2.play();
        
        if (player2Health > 10) {
            triggerHurtAnimation(player2Sprite, 'assets/hurt/player2/hurt.png', 'assets/hurt/player2/hurt.png', 'assets/idle/player2/idle1.png');
            // Quay mặt lại đối thủ khi bị tấn công
            if (player1PositionX > player2PositionX) {
                player2.style.transform = 'rotateY(0deg)';
            } else {
                player2.style.transform = 'rotateY(180deg)';
            }
        }
    }
    setTimeout(() => { player1Attacking = false; }, 300);
}

// Player 2 tấn công (phím '1')
if (keyState['1'] && !player2Attacking && !player2Moving && !isPlayer2Blocking) {
    slash_P2.play()
    player2Attacking = true;
    if (Math.abs(player2PositionX - player1PositionX) <= HITBOX_RANGE) {
        if (player2PositionX < player1PositionX) {
            player2.style.transform = 'rotateY(0deg)';
        } else {
            player2.style.transform = 'rotateY(180deg)';
        }
    }
    triggerAttackAnimation(player2Sprite, 'assets/attack/player2/hit1.png', 'assets/attack/player2/hit2.png', 'assets/idle/player2/idle1.png');
    if (checkHitbox(player2PositionX, player2PositionY, player1PositionX, player1PositionY, HITBOX_RANGE)) {
        if (isPlayer1Blocking) {
            player1Health -= 20 * 0.2;
        } else {
            player1Health -= 20;
        }
        player2Energy += 10;
        if (player2Energy > 100) player2Energy = 100;
        hurtVoice_p1.play();
        
        if (player1Health > 10) {
            triggerHurtAnimation(player1Sprite, 'assets/hurt/player1/hurt.png', 'assets/hurt/player1/hurt.png', 'assets/idle/player1/idle1.png');
            // Quay mặt lại đối thủ khi bị tấn công
            if (player2PositionX > player1PositionX) {
                player1.style.transform = 'rotateY(0deg)';
            } else {
                player1.style.transform = 'rotateY(180deg)';
            }
        }
    }
    setTimeout(() => { player2Attacking = false; }, 300);
}


// Ultimate Player 1 (phím 'i') - Lướt về phía trước
if (keyState['i'] && player1Energy >= FINAL_ATTACK_COST) {
    ultimateSound.play();
    ultimateVoice_p1.play();

    triggerAttackAnimation(player1Sprite, 'assets/attack/player1/ult1.png', 'assets/attack/player1/ult2.png', 'assets/idle/player1/idle1.png');

    let initialPositionX = player1PositionX; // Lưu lại vị trí ban đầu

    // Lướt về phía trước (di chuyển 100px)
    if (player1PositionX < player2PositionX) {
        player1PositionX += 50; 
        player1.style.transform = 'rotateY(0deg)';  
    } else if (player1PositionX > player2PositionX) {
        player1PositionX -= 50;  
        player1.style.transform = 'rotateY(180deg)'; 
    }
    player1.style.left = player1PositionX + 'px';

    // Cập nhật hitbox của Player 1 sau khi di chuyển
    if (checkHitbox(player1PositionX, player1PositionY, player2PositionX, player2PositionY, HITBOX_RANGE)) {
        // Kiểm tra va chạm
        if (!isPlayer2Blocking) {
            player2Health -= FINAL_ATTACK_DAMAGE;
        } else {
            player2Health -= FINAL_ATTACK_DAMAGE * 0.2; // Chặn giảm 80% sát thương
        }
        hurtVoice_p2.play();
        console.log("Player 1 đã sử dụng trúng Ultimate z");
        
        if (player2Health > 10) {
            triggerHurtAnimation(player2Sprite, 'assets/hurt/player2/hurt.png', 'assets/hurt/player2/hurt.png', 'assets/idle/player2/idle1.png');
        }
    }

    // Trừ năng lượng khi sử dụng Ultimate
    player1Energy -= FINAL_ATTACK_COST;
    if (player1Energy < 0) player1Energy = 0;
}

// Ultimate Player 2 (phím '5') - Lướt về phía trước
if (keyState['5'] && player2Energy >= FINAL_ATTACK_COST) {
    // Phát âm thanh khi Ultimate được sử dụng
    ultimateSound.play();
    ultimateVoice_p2.play();

    // Triggers the Ultimate attack animation
    triggerAttackAnimation(player2Sprite, 'assets/attack/player2/ult1.png', 'assets/attack/player2/ult2.png', 'assets/idle/player2/idle1.png');

    let initialPositionX = player2PositionX; // Lưu lại vị trí ban đầu

    // Lướt về phía trước (di chuyển 100px)
    if (player2PositionX < player1PositionX) {
        player2PositionX += 50; 
        player2.style.transform = 'rotateY(0deg)';  
    } else if (player2PositionX > player1PositionX) {
        player2PositionX -= 50;  
        player2.style.transform = 'rotateY(180deg)'; 
    }
    player2.style.left = player2PositionX + 'px';

    // Cập nhật hitbox của Player 2 sau khi di chuyển
    if (checkHitbox(player2PositionX, player2PositionY, player1PositionX, player1PositionY, HITBOX_RANGE)) {
        // Kiểm tra va chạm
        if (!isPlayer1Blocking) {
            player1Health -= FINAL_ATTACK_DAMAGE;
        } else {
            player1Health -= FINAL_ATTACK_DAMAGE * 0.2; // Chặn giảm 80% sát thương
        }
        
        // Player 1 bị tấn công xuất hiện animation khác
        if (player1Health > 10) {
            triggerHurtAnimation(player1Sprite, 'assets/hurt/player1/hurt.png', 'assets/hurt/player1/hurt.png', 'assets/idle/player1/idle1.png');
        }
        hurtVoice_p1.play();
        console.log("Player 2 đã sử dụng trúng Ultimate x");
    }

    // Trừ năng lượng khi sử dụng Ultimate
    player2Energy -= FINAL_ATTACK_COST;
    if (player2Energy < 0) player2Energy = 0;

    // Cập nhật lại vị trí hitbox của Player 2 sau khi di chuyển
    updateHealthBar();
    updatemanaBar();
}


    // Kiểm tra giới hạn vị trí của Player 1 và Player 2
    const player1Bounds = keepPlayerInBounds(player1, player1PositionX, player1PositionY);
    player1PositionX = player1Bounds.playerPositionX;
    player1PositionY = player1Bounds.playerPositionY;

    const player2Bounds = keepPlayerInBounds(player2, player2PositionX, player2PositionY);
    player2PositionX = player2Bounds.playerPositionX;
    player2PositionY = player2Bounds.playerPositionY;

    // Cập nhật vị trí của các nhân vật
    player1.style.left = player1PositionX + 'px';
    player1.style.top = player1PositionY + 'px';
    player2.style.left = player2PositionX + 'px';
    player2.style.top = player2PositionY + 'px';

    updateHealthBar();
    updatemanaBar();
    checkGameOver();
}

/////////////////////////////////////////////////// RESTART TRÒ CHƠI //////////////////////////////////////////////
// Thông báo endgame
function showGameOver(message) {
    winnerMessage.textContent = message;
    gameOverMessage.style.display = 'block';
    document.removeEventListener('keydown', handleKeyDown);
}

function resetGame() {
    player1PositionX = 50;
    player1PositionY = 284;
    player2PositionX = 650;
    player2PositionY = 284;
    player1.style.transform = 'rotateY(0deg)';
    player2.style.transform = 'rotateY(180deg)';
    document.getElementById('player1Sprite').src = 'assets/idle/player1/idle1.png';
    document.getElementById('player2Sprite').src = 'assets/idle/player2/idle1.png';
    document.getElementById('player1Sprite').style.opacity = 1;
    document.getElementById('player2Sprite').style.opacity = 1;

    player1Health = 200;
    player2Health = 200;

    player1Energy = 100;
    player2Energy = 100;

    player1.style.left = player1PositionX + 'px';
    player1.style.top = player1PositionY + 'px';
    player2.style.left = player2PositionX + 'px';
    player2.style.top = player2PositionY + 'px';

    healthBar1.style.width = player1Health + 'px';
    healthBar2.style.width = player2Health + 'px';

    manaBar1.style.width = player1Energy + 'px';
    manaBar2.style.width = player2Energy + 'px';

    gameOverMessage.style.display = 'none';
    const floatingText = document.getElementById('floatingText');
    floatingText.style.display = 'none';

    document.addEventListener('keydown', handleKeyDown);
}

window.onload = resetGame;
