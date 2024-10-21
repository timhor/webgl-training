import { vec3 } from 'gl-matrix';

import { Camera } from './camera';
import { Mesh } from './mesh';
import { Program } from './program';

import vertexShaderSource from './shaders/vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/fragment-shader.glsl?raw';

/**
 * Represents our triangle mesh, containing all the logic needed to render it.
 */
export class Triangle {
  /**
   * The mesh that defines the triangle's geometry.
   */
  private mesh: Mesh;

  /**
   * The program that will be used to render the triangle.
   */
  private program: Program;

  /**
   * Creates a new instance of our Triangle, which will render a simple triangle to the
   * screen.
   *
   * @param gl The WebGL rendering context.
   * @param camera The camera that will be used to view the scene.
   */
  constructor(
    private gl: WebGL2RenderingContext,
    private camera: Camera
  ) {
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
    this.mesh = new Mesh(this.gl, [
      // Top of the triangle
      vec3.fromValues(0, 0.5, 0),
      // Bottom left of the triangle
      vec3.fromValues(-0.5, -0.5, 0),
      // Bottom right of the triangle
      vec3.fromValues(0.5, -0.5, 0),
    ]);

    // Create a program that we'll use to render the triangle
    this.program = new Program(gl, vertexShaderSource, fragmentShaderSource);
  }

  /**
   * Renders the triangle to the screen. This method should be called every frame.
   */
  public render() {
    // We need to bind the program before setting any uniforms
    this.program.use();

    // Set the view-projection matrix
    const viewProjectionMatrixUniform = this.program.getUniformLocation(
      'uViewProjectionMatrix'
    );
    this.gl.uniformMatrix4fv(
      viewProjectionMatrixUniform,
      // The second argument is unused and must always be false (it makes no
      // sense why it's part of the API)
      false,
      this.camera.getViewProjectionMatrix()
    );

    // Set the colour of the triangle
    const colour1Uniform = this.program.getUniformLocation('uColour1');
    this.gl.uniform3fv(colour1Uniform, vec3.fromValues(1, 0.18, 0.569));
    const colour2Uniform = this.program.getUniformLocation('uColour2');
    this.gl.uniform3fv(colour2Uniform, vec3.fromValues(1, 0.753, 0.18));

    // Set the time uniform
    const timeUniform = this.program.getUniformLocation('uTime');
    this.gl.uniform1f(
      timeUniform,
      performance.now() / 1000 // Convert to seconds
    );

    // Render the triangle, using 'aPosition' as the attribute that will receive
    // the vertex positions
    this.mesh.render(this.program, 'aPosition');
  }
}
