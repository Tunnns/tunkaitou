// ------------------------------------------- WEBSITE SUPPORT ------------------------------------------ //
// Link reditect
function goPage(url) {
  window.location.href = url;
}

// Hiển thị Toast - class: link-unset
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.link-unset');
  const toast = document.getElementById('toast');

  // tạo audio 1 lần
  const audio = new Audio('../src/assets/sounds/minecraftsayno.mp3', 'src/assets/sounds/minecraftsayno.mp3');
  audio.preload = 'auto'; // preload
  audio.load(); // tải sẵn âm thanh
  audio.volume = 0.5; // giảm âm

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toast.classList.add('show');
      audio.currentTime = 0;
      audio.play().catch(err => console.warn('Âm thanh bị chặn:', err));
      setTimeout(() => toast.classList.remove('show'), 2000);
      console.log(`Âm thanh: NO`);
    });
  });
});


// Hover sản phẩm
// const tooltip = document.getElementById('hover-tooltip');
// document.querySelectorAll('.product-map').forEach(card => {
//   card.addEventListener('mousemove', e => {
//     tooltip.style.left = e.pageX + 10 + 'px';
//     tooltip.style.top = e.pageY + 10 + 'px';
//     tooltip.style.opacity = 1;
//   });
//   card.addEventListener('mouseleave', () => {
//     tooltip.style.opacity = 0;
//   });
// });

// ------------------------------------------ AVATAR YOUTUBE ------------------------------------------ //
// Kênh Kaitouu
const kaitouu = {
  id: "UC-PlnkyuX0kh66mgebxPkUA",
  key: "AIzaSyBlLoBQf6QfdnBdDJ5JrLwy4wDMxL57zKo",
  element: "yt-avatar-kaitouu"
};

// Kênh BigD
const bigd = {
  id: "UCJnudUAeV0EqM2SsP-Zakbg",
  key: "AIzaSyBlLoBQf6QfdnBdDJ5JrLwy4wDMxL57zKo",
  element: "yt-avatar-bigd"
};

// Hàm cập nhật avatar YouTube theo kênh
async function updateYouTubeAvatar(channel) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel.id}&key=${channel.key}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const avatarUrl = data.items[0].snippet.thumbnails.high.url;
      document.getElementById(channel.element).src = avatarUrl;
      console.log(`Đã cập nhật avatar ${channel.element}`);
    } else {
      console.warn(`Không tìm thấy dữ liệu ${channel.id}`);
    }
  } catch (err) {
    console.error(`Lỗi lấy avatar (${channel.id}):`, err);
  }
}

// Cập nhật avatar khi trang load
document.addEventListener("DOMContentLoaded", () => {
  updateYouTubeAvatar(kaitouu);
  updateYouTubeAvatar(bigd);
});

// ------------------------------------ MOBILE UI/UX -----------------------------------------


// ------------------------------------ ANTI ELEMENT CONSOLE -----------------------------------------
document.onkeydown = function (e) {
  if (
    e.keyCode == 123 || // F12
    (e.ctrlKey && e.shiftKey && e.keyCode == 73) || // Ctrl+Shift+I
    (e.ctrlKey && e.shiftKey && e.keyCode == 74) || // Ctrl+Shift+J
    (e.ctrlKey && e.shiftKey && e.keyCode == 67) || // Ctrl+Shift+C
    (e.ctrlKey && e.keyCode == 85) // Ctrl+U
  ) {
    e.preventDefault();
    return false;
  }
};

document.addEventListener('contextmenu', event => event.preventDefault());
