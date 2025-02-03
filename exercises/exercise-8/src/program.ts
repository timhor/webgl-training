import { mat4, vec3 } from 'gl-matrix';

/**
 * Represents a WebGL program, which combines compiled vertex and fragment
 * shaders.
 *
 * In WebGL, a program is a combination of shaders that run on the GPU (Graphics
 * Processing Unit). It's essential for rendering objects. The program consists
 * of two main parts:
 *
 * 1. Vertex Shader: This shader runs once for each vertex (point) in your 3D
 *    model. Its main job is to determine where on the screen each vertex should
 *    be drawn. It can also pass data (like colors) to the fragment shader.
 *
 *    Example: If you want to move an object around on the screen, you would use
 *    the vertex shader to change the position of all its vertices.
 *
 * 2. Fragment Shader: This shader runs once for every pixel that will be drawn
 *    on the screen. Its main job is to determine the color of each pixel.
 *
 *    Example: If you're drawing a red triangle, the fragment shader would
 *    output the color red for each pixel of that triangle.
 *
 * The program links these shaders together, allowing data to flow from the
 * vertex shader to the fragment shader, and ultimately producing the final
 * image on your screen.
 */
export class Program {
  /**
   * The WebGL program object. This is the result of compiling and linking
   * vertex and fragment shaders. It represents a complete GPU program that can
   * be used for rendering.
   */
  public program: WebGLProgram;

  /**
   * Creates a new Program instance.
   *
   * @param gl The WebGL rendering context.
   * @param vertexShaderSource The source code of the vertex shader as a string.
   * @param fragmentShaderSource The source code of the fragment shader as a
   * string.
   */
  constructor(
    private gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    // Compile the vertex and fragment shaders
    const vertexShader = this.compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    // Create and link the WebGL program
    this.program = this.createProgram(vertexShader, fragmentShader);
  }

  /**
   * Compiles a shader of the specified type with the given source code.
   *
   * Shaders are written in a special language (GLSL) and need to be compiled
   * before they can be used in a WebGL program.
   *
   * @param type The type of shader to compile (VERTEX_SHADER or
   * FRAGMENT_SHADER).
   * @param source The source code of the shader.
   * @returns The compiled WebGLShader object.
   */
  private compileShader(type: number, source: string): WebGLShader {
    // Create a new shader object
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error(`Failed to create shader of type ${type}`);
    }

    // Set the source code of the shader
    this.gl.shaderSource(shader, source);

    // Compile the shader
    this.gl.compileShader(shader);

    // Check if the compilation was successful
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      throw new Error(`Failed to compile shader: ${info}`);
    }

    return shader;
  }

  /**
   * Creates a WebGL program by linking the provided vertex and fragment
   * shaders.
   *
   * Linking shaders into a program allows WebGL to ensure that the vertex
   * shader and fragment shader can work together properly.
   *
   * @param vertexShader The compiled vertex shader.
   * @param fragmentShader The compiled fragment shader.
   * @returns The linked WebGLProgram object.
   */
  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    // Create a new program object
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create program');
    }

    // Attach the vertex and fragment shaders to the program
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);

    // Link the program
    this.gl.linkProgram(program);

    // Check if the linking was successful
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      throw new Error(`Failed to link program: ${info}`);
    }

    return program;
  }

  /**
   * Uses this program for rendering.
   *
   * This method should be called before drawing anything that should use this
   * program. It tells WebGL to use this specific combination of vertex and
   * fragment shaders for the next things we're going to draw.
   */
  use(): void {
    this.gl.useProgram(this.program);
  }

  /**
   * Gets the location of an attribute variable in the program.
   *
   * Attributes are input variables used in the vertex shader. They are used to
   * specify input data that changes for each vertex, like the vertex position.
   *
   * @param name The name of the attribute as it appears in the shader code.
   * @returns The location of the attribute. This is a number that can be used
   * to refer to the attribute in other WebGL functions.
   */
  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  /**
   * Gets the location of a uniform variable in the program.
   *
   * Uniforms are variables that stay the same for all vertices and fragments in
   * a single draw call (like a constant). They can be used in both vertex and
   * fragment shaders.
   *
   * @param name The name of the uniform as it appears in the shader code.
   * @returns The location of the uniform. This is a number that can be used to
   * refer to the uniform in other WebGL functions.
   */
  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program, name);
  }

  /**
   * Sets a `float` uniform variable in the program.
   *
   * @param location The location of the uniform variable in the program, as
   * returned by {@link getUniformLocation}.
   * @param value The value to set the uniform to.
   */
  setUniform1f(location: WebGLUniformLocation | null, value: number): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();

    this.gl.uniform1f(location, value);

    // Unbind the program to avoid accidental changes
    this.gl.useProgram(null);
  }

  /**
   * Sets a `int` uniform variable in the program.
   *
   * @param location The location of the uniform variable in the program, as
   * returned by {@link getUniformLocation}.
   * @param value The value to set the uniform to.
   */
  setUniform1i(location: WebGLUniformLocation | null, value: number): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();

    this.gl.uniform1i(location, value);

    // Unbind the program to avoid accidental changes
    this.gl.useProgram(null);
  }

  /**
   * Sets a `vec3` uniform variable in the program.
   *
   * @param location The location of the uniform variable in the program, as
   * returned by {@link getUniformLocation}.
   * @param value The value to set the uniform to.
   */
  setUniform3f(location: WebGLUniformLocation | null, value: vec3): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();

    this.gl.uniform3fv(location, value);

    // Unbind the program to avoid accidental changes
    this.gl.useProgram(null);
  }

  /**
   * Sets a `mat4` uniform variable in the program.
   *
   * @param location The location of the uniform variable in the program, as
   * returned by {@link getUniformLocation}.
   * @param value The value to set the uniform to.
   */
  setUniformMatrix4f(location: WebGLUniformLocation | null, value: mat4): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();

    // The second argument is unused and must always be false (it makes no sense
    // why it's part of the API)
    this.gl.uniformMatrix4fv(location, false, value);

    // Unbind the program to avoid accidental changes
    this.gl.useProgram(null);
  }
}
