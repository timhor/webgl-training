import { App } from './app';

const app = new App();

window.onload = () =>
  app.init({
    canvas: document.getElementById('webgl-canvas') as HTMLCanvasElement,
  });
