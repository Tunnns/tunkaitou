const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const finalScreen = document.getElementById('finalScreen');
const introImage = document.querySelector('.intro-image');
const nextHint = document.querySelector('.next-hint');

let step = 0;

// Khi trang load -> fade + zoom ảnh đầu
window.addEventListener('load', () => {
  setTimeout(() => {
    introImage.classList.add('show');
  }, 100); // delay nhẹ cho transition mượt
});

// Cơ chế click
document.body.addEventListener('click', () => {
  if (step === 0) {
    screen1.classList.add('hidden');
    screen2.classList.remove('hidden');
    step++;
  } else if (step === 1) {
    screen2.classList.add('hidden');
    finalScreen.classList.remove('hidden');
    setTimeout(() => finalScreen.classList.add('show'), 50);
    step++;
  }
});

// Khi ảnh fade + zoom xong -> bắt đầu lắc kiểu anime
introImage.addEventListener('transitionend', () => {
  introImage.classList.add('shake');
   setTimeout(() => {
      nextHint.classList.add('show');
    }, 1000);
  
});

const secondImage = document.querySelector('.second-image');

document.body.addEventListener('click', () => {
  if (step === 0 && nextHint.classList.contains('show')) {
    screen1.classList.add('hidden');
    screen2.classList.remove('hidden');
    // Kích hoạt fade cho scene2
    setTimeout(() => {
      secondImage.classList.add('show', 'shake');
    }, 100);
    step++;
  } else if (step === 1 && document.querySelector('.second-hint').classList.contains('show')) {
    screen2.classList.add('hidden');
    finalScreen.classList.remove('hidden');
    setTimeout(() => finalScreen.classList.add('show'), 50);
    step++;
  }
});
