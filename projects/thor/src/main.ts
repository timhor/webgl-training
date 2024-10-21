import { RenderManager } from './render-manager';

function main() {
  const canvas = document.getElementById('webgl-canvas');
  const renderManager = new RenderManager(canvas);

  renderManager.startRendering();
}

window.onload = main;
