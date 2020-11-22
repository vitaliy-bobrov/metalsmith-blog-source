window.CSS = window.CSS || {};

if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('/js/material-bg.js');
}
