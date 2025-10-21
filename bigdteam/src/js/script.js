// Link reditect
function goPage(url) {
  window.location.href = url;
}

// Hiển thị Toast - id: link-unset
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.link-unset');
  const toast = document.getElementById('toast');

  // tạo audio 1 lần
  const audio = new Audio('src/assets/sounds/minecraftsayno.mp3');
  audio.volume = 0.5; // giảm âm nếu cần

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toast.classList.add('show');
      audio.currentTime = 0;
      audio.play().catch(err => console.warn('Âm thanh bị chặn:', err));
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  });
});
