import { vec3 } from 'gl-matrix';
import { Mesh } from './mesh';
import { RenderManager } from './render-manager';
import { Program } from './program';

import vertexShaderSource from './shaders/vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/fragment-shader.glsl?raw';
import { Camera } from './camera';

function main() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element not found');
  }

  const renderManager = new RenderManager(canvas);

  const camera = new Camera(canvas);

  //        (0.0, 0.5, 0.0)
  //              /\
  //             /  \
  //            /    \
  //           /      \
  //          /________\
  // (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
  const triangle = new Mesh(renderManager.gl, [
    // Top of the triangle
    vec3.fromValues(0, 0.5, 0),
    // Bottom left of the triangle
    vec3.fromValues(-0.5, -0.5, 0),
    // Bottom right of the triangle
    vec3.fromValues(0.5, -0.5, 0),
  ]);

  const program = new Program(
    renderManager.gl,
    vertexShaderSource,
    fragmentShaderSource
  );

  const colourUniformLocation = program.getUniformLocation('uColour');
  const viewProjectionMatrix = program.getUniformLocation(
    'uViewProjectionMatrix'
  );

  renderManager.addRenderCallback(() => {
    const pulseR = Math.sin(performance.now() / 500) + 1;
    const pulseG = Math.sin(performance.now() / 800) + 1;
    const pulseB = Math.sin(performance.now() / 300) + 1;
    camera.zoom = (Math.sin(performance.now() / 500) + 1) / 2;
    camera.position[0] = Math.sin(performance.now() / 250);

    program.setUniformMat4(
      viewProjectionMatrix,
      camera.getViewProjectionMatrix()
    );

    program.setUniform3fv(
      colourUniformLocation,
      vec3.fromValues(pulseR, pulseG, pulseB)
    );

    triangle.render(program, 'aPosition');
  });

  renderManager.startRendering();
}

window.onload = main;
