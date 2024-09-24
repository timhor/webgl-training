// This script demonstrates how to draw a simple triangle using WebGL 2 and
// handle window resizing.

import { mat4 } from 'gl-matrix';

// Import shader strings Shaders are programs that run on the GPU and determine
// how our shape is drawn.
import vertexShaderSource from './vertex-shader.glsl?raw';
import fragmentShaderSource from './fragment-shader.glsl?raw';
import { context } from './webgl-context';
import { Player } from './player';

/**
 * Creates the data for a triangle.
 *
 * In 3D graphics, shapes are made up of points called vertices.
 * Here's what our triangle looks like:
 *
 *        (0.0, 0.5, 0.0)
 *              /\
 *             /  \
 *            /    \
 *           /      \
 *          /________\
 * (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
 *
 * Each vertex is represented by three numbers: (x, y, z)
 * In this 2D example, z is always 0.
 */
function createTriangleData(): Float32Array {
  return new Float32Array([
    0.0,
    0.5,
    0.0, // Top vertex (x, y, z)
    -0.5,
    -0.5,
    0.0, // Bottom-left vertex (x, y, z)
    0.5,
    -0.5,
    0.0, // Bottom-right vertex (x, y, z)
  ]);
}

/**
 * Sets up a buffer with our triangle data.
 *
 * A buffer is a way of sending data to the GPU. Here, we're sending the
 * positions of our triangle's vertices.
 */
function setupBuffer(data: Float32Array): WebGLBuffer | null {
  const gl = context.gl;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

/**
 * Sets up a Vertex Array Object (VAO) for our triangle.
 *
 * A VAO is like a container that stores information about how to read our
 * triangle's data. Think of it as a recipe that tells WebGL:
 * 1. Where to find the triangle's vertex data (in which buffer)
 * 2. How to interpret that data (e.g., every 3 numbers represent a point in 3D
 *    space)
 *
 * Using a VAO is beneficial because:
 * 1. It saves time: We set up the "recipe" once and can reuse it many times.
 * 2. It reduces mistakes: Once set up correctly, we're less likely to
 *    accidentally use the wrong data or interpret it incorrectly.
 * 3. It makes our code cleaner: We can group all the setup for one object (like
 *    our triangle) in one place.
 *
 * In more complex scenes with many objects, VAOs become even more helpful as
 * they allow us to easily switch between different objects and their data.
 *
 * @param program The WebGL program
 * @param triangleBuffer The buffer containing the triangle vertex data
 * @returns The created VAO
 */
function setupTriangleVAO(
  program: WebGLProgram,
  triangleBuffer: WebGLBuffer
): WebGLVertexArrayObject | null {
  const gl = context.gl;

  // Create a new VAO
  const vao = gl.createVertexArray();
  if (!vao) {
    console.error('Failed to create VAO');
    return null;
  }

  // Start setting up our "recipe"
  gl.bindVertexArray(vao);

  // Tell WebGL which buffer contains our triangle data
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);

  // Get the location of the 'position' attribute in our shader
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');

  // Enable the 'position' attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell WebGL how to read the data from our buffer:
  // - 3 numbers per vertex
  // - Those numbers are floats
  // - Don't normalize the data
  // - Each set of 3 numbers is 3 floats * 4 bytes per float = 12 bytes away
  //   from the previous one
  // - Start reading from the beginning of the buffer (offset 0)
  gl.vertexAttribPointer(
    positionAttributeLocation,
    3,
    gl.FLOAT,
    false,
    3 * 4,
    0
  );

  // We're done setting up, so we can unbind the VAO
  gl.bindVertexArray(null);

  return vao;
}

/**
 * Compiles a shader of the given type with the provided source code.
 *
 * Shaders are small programs that run on the GPU. They come in two types:
 * 1. Vertex shaders: Process each vertex of a shape.
 * 2. Fragment shaders: Process the color for each pixel of the rendered shape.
 *
 * Shaders are written in GLSL (OpenGL Shading Language), which is similar to C.
 */
function compileShader(type: number, source: string): WebGLShader | null {
  const gl = context.gl;

  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Failed to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Creates and links a WebGL program using the provided vertex and fragment
 * shaders.
 *
 * A WebGL program is a combination of a vertex shader and a fragment shader. It
 * defines how to process the geometry and color of what's being rendered.
 */
function createProgram(
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const gl = context.gl;

  const program = gl.createProgram();
  if (!program) {
    console.error('Failed to create program');
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Sets up the shaders and creates the WebGL program.
 *
 * This function compiles our vertex and fragment shaders and links them into a
 * program.
 */
function setupShaders(): WebGLProgram | null {
  const gl = context.gl;

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  return createProgram(vertexShader, fragmentShader);
}

/**
 * Creates the view matrix, which positions and orients the camera in the world.
 *
 * In 3D graphics, matrices are used to transform the positions of vertices.
 * This is crucial for:
 * 1. Positioning objects in the scene (Model matrix)
 * 2. Positioning and orienting the camera (View matrix)
 * 3. Projecting the 3D scene onto a 2D screen (Projection matrix)
 *
 * We use two main types of matrices here:
 *
 * 1. Projection Matrix:
 *    - Defines how we project 3D coordinates onto a 2D screen.
 *    - Two main types of projection: a) Orthographic projection:
 *         - Preserves parallel lines and relative sizes.
 *         - Useful for 2D games, UI elements, or architectural drawings. b)
 *           Perspective projection:
 *         - Creates the illusion of depth (objects farther away appear
 *           smaller).
 *         - More closely mimics how human eyes perceive the world.
 *         - Commonly used for 3D games and realistic 3D scenes.
 *    - In this example, we use perspective projection with these parameters:
 *      - Field of View (how wide our camera lens is)
 *      - Aspect Ratio (width/height of our viewport)
 *      - Near and Far clipping planes (what range of distances we render)
 *
 * 2. Model-View Matrix:
 *    - Combination of two conceptual matrices: a) Model Matrix: Positions and
 *      orients our object in the world. b) View Matrix: Positions and orients
 *      our camera in the world.
 *    - We combine these because mathematically, moving the camera left is
 *      equivalent to moving the whole world right.
 *
 * In our shader, we'll multiply our vertex positions by: Projection_Matrix *
 *    Model_View_Matrix * vertex_position This transforms the vertex from object
 *    space to clip space.
 *
 * Object Space vs Clip Space:
 * - Object Space (or Local Space): The coordinate system relative to the object
 *   itself. This is where the object's vertices are initially defined.
 * - Clip Space: The coordinate system after all transformations (model, view,
 *   projection) have been applied. It's a normalized space where X, Y, and Z
 *   coordinates range from -1 to 1. Anything outside this range gets "clipped"
 *   (not drawn).
 *
 * The transformation from Object Space to Clip Space allows WebGL to correctly
 * render our 3D scene on a 2D screen, handling perspective, camera position,
 * and object transformations.
 */
function getViewMatrix() {
  const viewMatrix = mat4.create();
  // Move the scene 3 units away from the camera (camera is at 0,0,0 looking
  // down -Z axis)
  mat4.translate(viewMatrix, viewMatrix, [
    -context.cameraPosition[0],
    -context.cameraPosition[1],
    -3.0,
  ]);
  mat4.scale(viewMatrix, viewMatrix, [
    context.cameraZoom,
    context.cameraZoom,
    1,
  ]);

  return viewMatrix;
}

/**
 * Handles window resize events. This function updates the canvas size and WebGL
 * viewport, and recalculates the projection matrix.
 *
 * Resizing is important for responsive design, ensuring our WebGL content looks
 * good on different screen sizes and when the browser window is resized.
 */
function handleResize(projectionMatrixLocation: WebGLUniformLocation | null) {
  const { gl, canvas } = context;

  // Update canvas size, taking into account the device pixel ratio for sharp
  // rendering on high DPI displays
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  // Update WebGL viewport to match new canvas size
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Recalculate projection matrix with new aspect ratio
  const screenSize = context.getScreenSize();
  const projectionMatrix = mat4.ortho(
    mat4.create(),
    -screenSize[0] / 2,
    screenSize[0] / 2,
    screenSize[1] / 2,
    -screenSize[1] / 2,
    0.1,
    100
  );

  // Update projection matrix in the shader
  if (projectionMatrixLocation) {
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  }
}

/**
 * Main function to set up WebGL and start the render loop.
 *
 * This function orchestrates the entire WebGL setup process:
 * 1. Set up the WebGL context and canvas
 * 2. Create the triangle data
 * 3. Set up a buffer with the triangle data
 * 4. Compile and link the shaders into a program
 * 5. Set up the transformation matrices
 * 6. Set up the resize event handler
 * 7. Start the render loop
 */
function main() {
  const gl = context.gl;

  // Create our triangle data and set up a buffer with it
  const triangleData = createTriangleData();
  const triangleBuffer = setupBuffer(triangleData);
  if (!triangleBuffer) {
    return;
  }

  // Set up shaders and create program
  const program = setupShaders();
  if (!program) {
    return;
  }

  // Use the program
  gl.useProgram(program);

  // Set up the triangle vertex array object, telling WebGL how to interpret the
  // triangle data
  const triangleVertexArray = setupTriangleVAO(program, triangleBuffer);

  // Perform initial resize to set up the projection matrix
  const projectionMatrixLocation = gl.getUniformLocation(
    program,
    'uProjectionMatrix'
  );
  const modelViewMatrixLocation = gl.getUniformLocation(
    program,
    'uModelViewMatrix'
  );
  handleResize(projectionMatrixLocation);

  // Set up resize handler
  window.addEventListener('resize', () => {
    handleResize(projectionMatrixLocation);
  });

  // Create our player
  const player = new Player();

  /**
   * Render function to be called each frame.
   *
   * This function clears the canvas, updates the model-view matrix, and draws
   * the triangle. It's called repeatedly to create animation.
   */
  function render() {
    if (!gl) {
      return;
    }

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get the view matrix for this frame
    const viewMatrix = getViewMatrix();

    // Get the model matrix for the player, and combine it with the view matrix
    const modelMatrix = player.getModelMatrix();
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    // Set model-view matrix
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    // Draw the player
    gl.bindVertexArray(triangleVertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // It's good practice to unbind things when we're done with them
    gl.bindVertexArray(null);

    // Request next frame
    requestAnimationFrame(render);
  }

  // Start the render loop
  render();
}

// Run the main function when the window loads
window.onload = main;
