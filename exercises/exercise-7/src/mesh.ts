import { vec2, vec3 } from 'gl-matrix';

import { Program } from './program';

/**
 * Represents a single vertex in a 3D mesh.
 */
interface Vertex {
  /**
   * The position of the vertex in 3D space.
   */
  position: vec3;
  /**
   * The texture coordinate of the vertex. This defines what point in the
   * texture should be mapped to this vertex.
   */
  uv: vec2;
}

// We need 3 components for position, plus 2 for UV
const COMPONENTS_PER_VERTEX = 3 + 2;

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
    private vertices: Vertex[]
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
    // data in a flat format, meaning that instead of an array of vector
    // objects, we create a single array where the individual components of each
    // vertex are laid out sequentially.
    const vertexData = new Float32Array(vertices.length * COMPONENTS_PER_VERTEX);
    for (let i = 0; i < vertices.length; i++) {
      // Each vertex has 3 position components (x, y, z)
      vertexData[i * COMPONENTS_PER_VERTEX] = vertices[i].position[0]; // x
      vertexData[i * COMPONENTS_PER_VERTEX + 1] = vertices[i].position[1]; // y
      vertexData[i * COMPONENTS_PER_VERTEX + 2] = vertices[i].position[2]; // z

      // Plus 2 UV components (u, v)
      vertexData[i * COMPONENTS_PER_VERTEX + 3] = vertices[i].uv[0]; // u
      vertexData[i * COMPONENTS_PER_VERTEX + 4] = vertices[i].uv[1]; // v
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

  /**
   * Renders the mesh using the specified program and attribute name.
   *
   * @param program The WebGL program to use for rendering.
   * @param positionAttributeName The name of the position attribute in the
   * vertex shader. This should match the name used in the shader code. For
   * example, if your vertex shader declares `in vec3 aPosition;`, then you
   * would pass `aPosition` here.
   * @param uvAttributeName The name of the UV attribute in the vertex shader.
   * This should match the name used in the shader code. For example, if your
   * vertex shader declares `in vec2 aUv;`, then you would pass `aUv` here.
   */
  render(
    program: Program,
    positionAttributeName: string,
    uvAttributeName: string
  ): void {
    // Use the specified program
    program.use();

    // Get the location of the attributes in the program. This basically allows
    // us to do things with the attributes without needing to refer to it by its
    // name every time.
    const positionAttributeLocation = program.getAttribLocation(
      positionAttributeName
    );
    const uvAttributeLocation = program.getAttribLocation(uvAttributeName);

    // By calling `enableVertexAttribArray`, we're telling WebGL that we want to
    // supply data to the attributes from a buffer. If we didn't call this, then
    // each attribute would have no data to read.
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.enableVertexAttribArray(uvAttributeLocation);

    // Bind our buffer containing vertex data, so that we can read from it
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    // Tell WebGL *how* to read the data from our buffer and supply it to each
    // attribute in the vertex shader
    this.gl.vertexAttribPointer(
      // We're defining the position attribute
      positionAttributeLocation,
      // How many components there are per vertex attribute. We have 3 because
      // each position is a vec3 (x, y, z)
      3,
      // The data type of each component. We use FLOAT as we created the buffer with
      // a Float32Array.
      this.gl.FLOAT,
      // Whether integer values should be normalized when being cast to a float.
      // This flag is not relevant for floating point numbers.
      false,
      // The stride: how many bytes to move forward to get from one vertex to
      // the next. We calculate this as 5 (components) * 4 (bytes per float) =
      // 20 bytes. This tells WebGL that each vertex's data is 20 bytes apart in
      // the buffer.
      COMPONENTS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT,
      // The offset: how many bytes inside the buffer to start from. 0 means
      // start at the beginning of the buffer.
      0
    );
    this.gl.vertexAttribPointer(
      // We're defining the UV attribute
      uvAttributeLocation,
      // Each texture coordinate is a vec2 (u, v)
      2,
      this.gl.FLOAT,
      false,
      // Stride
      COMPONENTS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT,
      // Offset. Unlike the position attribute, the UV attribute starts after
      // the first 3 components (12 bytes).
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    // Draw the mesh. TRIANGLES tells WebGL to interpret every three vertices as
    // a triangle. This corresponds to how we've defined our mesh geometry.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length);

    // Clean up any state that we set. This is good practice as it avoids us
    // accidentally using the wrong state later.
    this.gl.disableVertexAttribArray(positionAttributeLocation);
    this.gl.disableVertexAttribArray(uvAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.useProgram(null);
  }
}
