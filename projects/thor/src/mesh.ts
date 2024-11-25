import { vec3 } from 'gl-matrix';

export class Mesh {
  public buffer: WebGLBuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    vertices: vec3[]
  ) {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }

    this.buffer = buffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    // Flatten vertex array so all x, y, z components are laid out sequentially
    const vertexData = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
      vertexData[i * 3] = vertices[i][0];
      vertexData[i * 3 + 1] = vertices[i][1];
      vertexData[i * 3 + 2] = vertices[i][2];
    }

    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }
}
