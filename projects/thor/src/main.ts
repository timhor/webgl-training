import { RenderManager } from './render-manager';

import { Camera } from './camera';
import { TriangleObject } from './triangle';

function main() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element not found');
  }

  const renderManager = new RenderManager(canvas);

  const camera = new Camera(canvas);

  const triangleObject = new TriangleObject(renderManager.gl);

  renderManager.addRenderCallback(() => {
    camera.zoom = (Math.sin(performance.now() / 500) + 1) / 2;
    camera.position[0] = Math.sin(performance.now() / 250);
    triangleObject.render(camera);
  });

  renderManager.startRendering();
}

window.onload = main;
