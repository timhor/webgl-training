#version 300 es

in vec3 iOffset;
in vec3 iColor;

in vec3 aPosition;
in vec2 aUv;

uniform mat4 uViewProjectionMatrix;

out vec2 vUv;
out vec3 vColor;

void main() {
  vUv = aUv;
  vColor = iColor;

  gl_Position = uViewProjectionMatrix * vec4(aPosition + iOffset, 1.0);
}
