import { vec3 } from 'gl-matrix';
import { Mesh } from './mesh';
import { RenderManager } from './render-manager';
import { Program } from './program';

import vertexShaderSource from './shaders/vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/fragment-shader.glsl?raw';

function main() {
  const canvas = document.getElementById('webgl-canvas');
  const renderManager = new RenderManager(canvas);

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

  renderManager.addRenderCallback(() => {
    const pulse = (Math.sin(performance.now() / 500) + 1) / 2;

    program.setUniform3fv(colourUniformLocation, vec3.fromValues(pulse, 1, 1));
    triangle.render(program, 'aPosition');
  });

  renderManager.startRendering();
}

window.onload = main;
