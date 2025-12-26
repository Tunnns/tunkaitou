document.onkeydown = function (e) {
  if (
    e.keyCode == 123 || // F12
    (e.ctrlKey && e.shiftKey && e.keyCode == 73) || // Ctrl+Shift+I
    (e.ctrlKey && e.shiftKey && e.keyCode == 74) || // Ctrl+Shift+J
    // (e.ctrlKey && e.shiftKey && e.keyCode == 67) || // Ctrl+Shift+C
    (e.ctrlKey && e.keyCode == 85) // Ctrl+U
  ) {
    e.preventDefault();
    return false;
  }
};

document.addEventListener('contextmenu', event => event.preventDefault());
