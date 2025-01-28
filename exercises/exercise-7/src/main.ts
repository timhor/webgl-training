// Exercise 7: Implementing textures

import { Camera } from './camera';
import { RenderManager } from './render-manager';
import { TriangleObject } from './triangle-object';

/**
 * Main function to set up WebGL and start the render loop.
 */
function main() {
  // Set up the WebGL context and canvas
  const canvas = new RenderManager(document.getElementById('webgl-canvas'));

  // Create a camera that we'll use to view the scene
  const camera = new Camera(canvas.canvas);

  // Create a simple triangle mesh that we want to render
  const triangle = new TriangleObject(canvas.gl, camera);

  // Every frame, render the triangle using the program
  canvas.onRender(() => {
    // Move the camera in a circle
    camera.zoom = 1;
    camera.position[0] = Math.sin(performance.now() * 0.0002);
    camera.position[1] = Math.cos(performance.now() * 0.0002);

    // Render the triangle
    triangle.render();
  });

  // Start rendering to the canvas every frame
  canvas.startRendering();
}

// Run the main function when the window loads
window.onload = main;
