// Exercise 5: Adding a camera to the scene

import { vec3 } from 'gl-matrix';

import { Camera } from './camera';
import { Mesh } from './mesh';
import { Program } from './program';
import { RenderManager } from './render-manager';

import vertexShaderSource from './shaders/vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/fragment-shader.glsl?raw';

/**
 * Main function to set up WebGL and start the render loop.
 */
function main() {
  // Set up the WebGL context and canvas
  const canvas = new RenderManager(document.getElementById('webgl-canvas'));

  // Create a camera that we'll use to view the scene
  const camera = new Camera(canvas.canvas);

  // Create a simple triangle mesh that we want to render.
  //
  // In 3D graphics, shapes are made up of points called vertices.
  // Here's what our triangle looks like:
  //
  //        (0.0, 0.5, 0.0)
  //              /\
  //             /  \
  //            /    \
  //           /      \
  //          /________\
  // (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
  //
  // Each vertex is represented by three numbers: (x, y, z)
  // In this 2D example, z is always 0.
  const triangle = new Mesh(canvas.gl, [
    // Top of the triangle
    vec3.fromValues(0, 0.5, 0),
    // Bottom left of the triangle
    vec3.fromValues(-0.5, -0.5, 0),
    // Bottom right of the triangle
    vec3.fromValues(0.5, -0.5, 0),
  ]);

  // Create a program that we'll use to render the triangle
  const program = new Program(
    canvas.gl,
    vertexShaderSource,
    fragmentShaderSource
  );
  const viewProjectionMatrixUniform = program.getUniformLocation(
    'uViewProjectionMatrix'
  );
  const colourUniform = program.getUniformLocation('uColour');

  // Every frame, render the triangle using the program
  canvas.onRender(() => {
    // Move the camera in a circle
    camera.zoom = 0.5;
    camera.position[0] = Math.sin(performance.now() * 0.001);
    camera.position[1] = Math.cos(performance.now() * 0.001);

    // Set the view-projection matrix
    program.setUniformMatrix4f(
      viewProjectionMatrixUniform,
      camera.getViewProjectionMatrix()
    );

    // Set the colour of the triangle
    program.setUniform3f(
      colourUniform,
      // Red, pulsating
      vec3.fromValues(Math.sin(performance.now() * 0.005) / 2 + 0.5, 0, 0)
    );

    // Render the triangle, using 'aPosition' as the attribute that will receive
    // the vertex positions
    triangle.render(program, 'aPosition');
  });

  // Start rendering to the canvas every frame
  canvas.startRendering();
}

// Run the main function when the window loads
window.onload = main;
