export function createBuffer(gl: WebGL2RenderingContext) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('gl.createBuffer() failed');
  }
  return buffer;
}

export function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
) {
  const location = gl.getUniformLocation(program, name);
  if (!location) {
    throw new Error('could not create location');
  }
  return location;
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
export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${log}`);
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
export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);

    throw new Error(`program linking error: ${log}`);
  }

  return program;
}

/**
 * Sets up the shaders and creates the WebGL program.
 *
 * This function compiles our vertex and fragment shaders and links them into a
 * program.
 */
export function setupShaders(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  return createProgram(gl, vertexShader, fragmentShader);
}
