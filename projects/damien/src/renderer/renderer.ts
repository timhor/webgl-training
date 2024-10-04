import { createBuffer, getUniformLocation, setupShaders } from './gl-utils';

// Import shader strings Shaders are programs that run on the GPU and determine
// how our shape is drawn.
import vertexShaderSource from './shaders/vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/fragment-shader.glsl?raw';
import { mat4, vec3 } from 'gl-matrix';

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
 * @param gl The WebGL 2 rendering context
 * @param program The WebGL program
 * @param triangleBuffer The buffer containing the triangle vertex data
 * @returns The created VAO
 */
function setupTriangleVAO(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  triangleBuffer: WebGLBuffer
) {
  // Create a new VAO
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error('Failed to create VAO');
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

type MatrixLocations = {
  model: WebGLUniformLocation | null;
  view: WebGLUniformLocation | null;
  projection: WebGLUniformLocation | null;
};

type RendererConfig = {
  canvas: HTMLCanvasElement;
};

export class Renderer {
  private canvas?: HTMLCanvasElement;
  private gl?: WebGL2RenderingContext;
  private cleanupCallbacks: (() => void)[] = [];

  private getCanvas() {
    if (!this.canvas) {
      throw new Error('You must call renderer.init() first');
    }
    return this.canvas;
  }

  private getGL() {
    if (!this.gl) {
      throw new Error('You must call renderer.init() first');
    }
    return this.gl;
  }

  public matrices = {
    model: mat4.create(),
    view: mat4.create(),
    projection: mat4.create(),
  };

  private matrixLocations: MatrixLocations = {
    model: null,
    view: null,
    projection: null,
  };

  private triangleVertexArray?: WebGLVertexArrayObject;

  init(config: RendererConfig) {
    this.canvas = config.canvas;
    const gl = config.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('gl not supported');
    }
    this.gl = gl;
    this.setInitialMatrices();
    this.addTriangle();
  }

  private setInitialMatrices() {
    const canvas = this.getCanvas();
    const { view, projection } = this.matrices;
    mat4.translate(view, view, [0.0, 0.0, -3.0]);

    // Parameters: field of view (45 degrees), aspect ratio, near plane, far plane
    mat4.perspective(
      projection,
      Math.PI / 4,
      canvas.width / canvas.height,
      0.1,
      100
    );
  }

  private createLocationsForMatrices(program: WebGLProgram) {
    const gl = this.getGL();
    this.matrixLocations.model = getUniformLocation(
      gl,
      program,
      'uModelMatrix'
    );
    this.matrixLocations.view = getUniformLocation(gl, program, 'uViewMatrix');
    this.matrixLocations.projection = getUniformLocation(
      gl,
      program,
      'uProjectionMatrix'
    );
  }

  private addTriangle() {
    const gl = this.getGL();

    // make triangle data
    const triangleData = createTriangleData();

    // add that data to a buffer
    const triangleBuffer = createBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleData, gl.STATIC_DRAW);

    // Set up shaders and create program
    const program = setupShaders(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    this.createLocationsForMatrices(program);
    this.cleanupCallbacks.push(this.initAutoResize());
    this.triangleVertexArray = setupTriangleVAO(gl, program, triangleBuffer);
    this.render();
  }

  private initAutoResize() {
    const resize = () => {
      const canvas = this.getCanvas();
      const gl = this.getGL();

      // Update canvas size, taking into account the device pixel ratio for sharp
      // rendering on high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;

      // Update WebGL viewport to match new canvas size
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Recalculate projection matrix with new aspect ratio
      mat4.perspective(
        this.matrices.projection,
        Math.PI / 4,
        canvas.width / canvas.height,
        0.1,
        100
      );

      // Update projection matrix in the shader
      if (this.matrixLocations.projection) {
        gl.uniformMatrix4fv(
          this.matrixLocations.projection,
          false,
          this.matrices.projection
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }

  private render() {
    const gl = this.getGL();

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update matrices in gl
    gl.uniformMatrix4fv(this.matrixLocations.model, false, this.matrices.model);
    gl.uniformMatrix4fv(this.matrixLocations.view, false, this.matrices.view);

    if (this.triangleVertexArray) {
      gl.bindVertexArray(this.triangleVertexArray);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    }
  }

  public tick(time: number) {
    // TODO - derive these matrices from state I actually care about
    mat4.rotateZ(this.matrices.model, this.matrices.model, 0.01);
    // mat4.translate(
    //   this.matrices.model,
    //   this.matrices.model,
    //   vec3.fromValues(0.01, 0, 0)
    // );
    mat4.translate(
      this.matrices.view,
      this.matrices.view,
      vec3.fromValues(-0.01 * Math.sin(time * 0.01), 0, 0)
    );

    this.render();
  }

  public destroy() {
    this.cleanupCallbacks.forEach((cb) => cb());
  }
}
