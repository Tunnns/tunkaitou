// Tạo hiệu ứng hạt rơi
document.addEventListener('DOMContentLoaded', () => {
    const starContainer = document.querySelector('.snow');
    const numberOfStars = 100; // Số lượng hạt
    let isVisible = true;

    function createStar() {
        if (!isVisible) return

        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 3 + 2;
        const startPositionX = Math.random() * 100;
        const startPositionY = Math.random() * 100; 
        const animationDuration = Math.random() * 20 + 10; // Thời gian hoạt động ngẫu nhiên từ 10s đến 30s

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${startPositionX}%`;
        star.style.top = `${startPositionY}%`;
        star.style.animationDuration = `${animationDuration}s`;
        star.style.animationDelay = `${Math.random() * 20}s`; // Thêm độ trễ ngẫu nhiên

        starContainer.appendChild(star);

        star.addEventListener('animationend', () => {
            star.remove();
        });
    }

    for (let i = 0; i < numberOfStars; i++) {
        createStar();
    }

    // Tạo hạt mới theo thời gian
    const starInterval = setInterval(createStar, 1000); // Tạo mới một hạt mỗi giây

    // Kiểm tra trạng thái tab
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden; // Cập nhật trạng thái
        if (!isVisible) {
            clearInterval(starInterval); // Dừng tạo hạt khi không hiển thị
            // Xóa tất cả các hạt hiện có
            while (starContainer.firstChild) {
                starContainer.removeChild(starContainer.firstChild);
            }
        } else {
            // Nếu quay lại tab, khởi động lại việc tạo hạt
            setInterval(createStar, 1000);
        }
    });
});


// Hiệu ứng mèo nhảy
document.addEventListener('DOMContentLoaded', () => {
    const cat = document.getElementById('cat');
    const catSound = document.getElementById('cat-sound');

    if (cat && catSound) {
        cat.addEventListener('click', () => {
            catSound.play();

            cat.classList.add('jump');

            cat.addEventListener('animationend', () => {
                catSound.pause();
                catSound.currentTime = 0;
                cat.classList.remove('jump');
            }, { once: true });
        });
    }
});

// Chuyển hướng trang web game
// document.addEventListener('DOMContentLoaded', () => {
//    const actionButton = document.getElementById('action-button');

//    if (actionButton) {
//        actionButton.addEventListener('click', () => {
//            window.location.href = 'http://tunplaygame.x10.bz';
//        });
//    }
// });

// Đồng hồ
function updateColors() {
    const hour = new Date().getHours();
    const body = document.body;
    const dayxh = document.querySelector('.dayxh');

    if (hour >= 6 && hour < 18) {
        body.style.backgroundColor = "#000000";
        dayxh.style.backgroundColor = "#000000";
    } else {
        body.style.backgroundColor = "#000000";
        dayxh.style.backgroundColor = "#000000";
    }
}

function fadeIn() {
    document.body.classList.add('visible');
    document.body.style.overflow = 'auto';
}

function updateDongho() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('Dongho').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateDongho, 1000);
updateDongho();

// lựa chọn game

function showChoices() {
    const choicesTable = document.getElementById("choices-table");
    choicesTable.style.display = "flex";
    setTimeout(() => {
        choicesTable.style.opacity = 1;
    }, 10);
}

function hideChoices() {
    const choicesTable = document.getElementById("choices-table");
    choicesTable.style.opacity = 0;
    setTimeout(() => {
        choicesTable.style.display = "none";
    }, 300);
}

function redirectTo(url) {
    window.location.href = url;
}

window.onclick = function(event) {
    const choicesTable = document.getElementById("choices-table");
    if (!choicesTable.contains(event.target) && event.target !== document.getElementById("action-button")) {
        hideChoices();
    }
};

// end
window.onload = function() {
    updateColors();
    setTimeout(fadeIn, 100);
};

