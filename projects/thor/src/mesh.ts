import { vec2, vec3 } from 'gl-matrix';
import { Program } from './program';

interface Vertex {
  position: vec3;
  uv: vec2;
}

const elementsPerPosition = 3;
const elementsPerUV = 2;
const elementsPerVertex = elementsPerPosition + elementsPerUV;

export class Mesh {
  public buffer: WebGLBuffer;
  private vertexCount: number;

  constructor(
    private gl: WebGL2RenderingContext,
    vertices: Vertex[]
  ) {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }

    this.buffer = buffer;
    this.vertexCount = vertices.length;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    // Flatten vertex array so all x, y, z components are laid out sequentially
    const vertexData = new Float32Array(vertices.length * elementsPerVertex);
    for (let i = 0; i < vertices.length; i++) {
      // x, y, z
      vertexData[i * elementsPerVertex] = vertices[i].position[0];
      vertexData[i * elementsPerVertex + 1] = vertices[i].position[1];
      vertexData[i * elementsPerVertex + 2] = vertices[i].position[2];

      // u, v
      vertexData[i * elementsPerVertex + 3] = vertices[i].uv[0];
      vertexData[i * elementsPerVertex + 4] = vertices[i].uv[1];
    }

    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  // Display the mesh on screen
  render(
    program: Program,
    positionVariableName: string,
    uvAttributeName: string
  ) {
    program.use();

    const positionAttributeLocation =
      program.getAttribLocation(positionVariableName);
    const uvAttributeLocation = program.getAttribLocation(uvAttributeName);

    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.enableVertexAttribArray(uvAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(
      positionAttributeLocation,
      elementsPerPosition,
      this.gl.FLOAT,
      false,
      elementsPerVertex * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    this.gl.vertexAttribPointer(
      uvAttributeLocation,
      elementsPerUV,
      this.gl.FLOAT,
      false,
      elementsPerVertex * Float32Array.BYTES_PER_ELEMENT,
      elementsPerPosition * Float32Array.BYTES_PER_ELEMENT
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);

    // Reset / cleanup
    this.gl.disableVertexAttribArray(positionAttributeLocation);
    this.gl.disableVertexAttribArray(uvAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.useProgram(null);
  }
}
