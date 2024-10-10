import { vec3 } from 'gl-matrix';

/**
 * Represents a 3D mesh in WebGL. A mesh is a collection of vertices that define
 * the shape of a 3D object.
 */
export class Mesh {
  /**
   * WebGL buffer object that stores the vertex data of the mesh.
   *
   * A buffer in WebGL is a block of memory on the GPU that holds raw vertex
   * data. Buffers are essential in WebGL as they enable the GPU to directly
   * access vertex data when rendering. This is significantly faster than if we
   * had to send all of the individual vertices every single frame.
   */
  public buffer: WebGLBuffer;

  /**
   * Creates a new Mesh instance.
   *
   * @param gl The WebGL rendering context.
   * @param vertices An array of 3D vectors representing the vertices of the
   * mesh.
   */
  constructor(
    private gl: WebGL2RenderingContext,
    vertices: vec3[]
  ) {
    // Create a new buffer object
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }

    this.buffer = buffer;

    // Bind the buffer to the ARRAY_BUFFER target. WebGL is a state machine, and
    // most operations work on some currently bound object.
    //
    // Binding a buffer means setting it as the current buffer for a specific
    // "binding point". ARRAY_BUFFER is the binding point for vertex attribute
    // data. After this call, any operations on ARRAY_BUFFER will affect our
    // buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    // Convert the vertices array into a flat Float32Array. WebGL expects our
    // data in a flat format, meaning that instead of an array of vec3 objects,
    // we create a single array where the x, y, z components of each vertex are
    // laid out sequentially.
    const vertexData = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
      // Each vertex has 3 components (x, y, z)
      vertexData[i * 3] = vertices[i][0]; // x
      vertexData[i * 3 + 1] = vertices[i][1]; // y
      vertexData[i * 3 + 2] = vertices[i][2]; // z
    }

    // Store the vertex data in the buffer
    this.gl.bufferData(
      // We bound `this.buffer` to the ARRAY_BUFFER target earlier, so this call
      // will store the data in `this.buffer`.
      this.gl.ARRAY_BUFFER,
      // The data to send
      vertexData,
      // Hint to WebGL about how we plan to use the data. STATIC_DRAW means that
      // we will not modify the data after sending it.
      this.gl.STATIC_DRAW
    );

    // Unbind the buffer. This is good practice because:
    // 1. It prevents accidental modification of this buffer when we don't
    //    intend to.
    // 2. It helps catch errors: if we forget to bind a buffer before using it
    //    later, we'll get an error instead of silently operating on the wrong
    //    buffer.
    // 3. It leaves the WebGL state clean, which can make debugging easier.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }
}
