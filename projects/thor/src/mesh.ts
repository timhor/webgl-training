import { vec2, vec3 } from 'gl-matrix';
import { Program } from './program';

interface Vertex {
  position: vec3;
  uv: vec2;
}

interface InstanceAttributeDefinition {
  // Name of the attribute in the shader
  name: string;
  // How many floats per instance
  size: number;
}

interface InstanceAttribute extends InstanceAttributeDefinition {
  offset: number;
}

const elementsPerPosition = 3;
const elementsPerUV = 2;
const elementsPerVertex = elementsPerPosition + elementsPerUV;

export class Mesh {
  public buffer: WebGLBuffer;
  public instanceBuffer: WebGLBuffer;
  private instanceCount: number = 0;
  private instanceAttributes: Map<string, InstanceAttribute> = new Map();
  private instanceAttributeSize: number = 0;
  private vertexCount: number;

  constructor(
    private gl: WebGL2RenderingContext,
    vertices: Vertex[],
    instanceAttributeDefinition: InstanceAttributeDefinition[] = []
  ) {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }

    this.buffer = buffer;

    const instanceBuffer = this.gl.createBuffer();
    if (!instanceBuffer) {
      throw new Error('Failed to create instance buffer');
    }
    this.instanceBuffer = instanceBuffer;

    let offset = 0;
    for (const attr of instanceAttributeDefinition) {
      this.instanceAttributes.set(attr.name, {
        ...attr,
        offset,
      });
      offset += attr.size;
      this.instanceAttributeSize += attr.size;
    }

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

  setInstanceCount(instanceCount: number) {
    this.instanceCount = instanceCount;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);

    const instanceData = new Float32Array(
      instanceCount * this.instanceAttributeSize
    );
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      instanceData,
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  setInstanceProperty<T extends Float32Array>(
    index: number,
    name: string,
    data: T
  ) {
    const attribute = this.instanceAttributes.get(name);
    if (!attribute) {
      throw new Error(`Attribute ${name} not found`);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      (index * this.instanceAttributeSize + attribute.offset) *
        Float32Array.BYTES_PER_ELEMENT,
      data
    );

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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    for (const [name, attribute] of this.instanceAttributes) {
      const attributeLocation = program.getAttribLocation(name);
      this.gl.enableVertexAttribArray(attributeLocation);

      this.gl.vertexAttribPointer(
        attributeLocation,
        attribute.size,
        this.gl.FLOAT,
        false,
        this.instanceAttributeSize * Float32Array.BYTES_PER_ELEMENT,
        attribute.offset * Float32Array.BYTES_PER_ELEMENT
      );

      this.gl.vertexAttribDivisor(attributeLocation, 1);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    this.gl.drawArraysInstanced(
      this.gl.TRIANGLES,
      0,
      this.vertexCount,
      this.instanceCount
    );

    // Reset / cleanup
    this.gl.disableVertexAttribArray(positionAttributeLocation);
    this.gl.disableVertexAttribArray(uvAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.useProgram(null);
  }
}
