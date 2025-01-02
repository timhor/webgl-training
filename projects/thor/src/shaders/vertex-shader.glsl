#version 300 es

in vec3 aPosition;

uniform mat4 uViewProjectionMatrix;

void main() {
  gl_Position = uViewProjectionMatrix * vec4(aPosition, 1.0);
}
