#version 300 es

#define PI 3.14159265359

in vec3 aPosition;

uniform mat4 uViewProjectionMatrix;
uniform float uTime;

out float vGradientAmount;

void main() {
  float angle = sin(uTime) * 30.0;
  float angleRadians = angle * PI / 180.0;
  mat2 rotate = mat2(cos(angleRadians), -sin(angleRadians), sin(angleRadians), cos(angleRadians));

  // Add offset so we work with 0 -> 1 range
  vGradientAmount = (aPosition.xy * rotate).x + 0.5;

  gl_Position = uViewProjectionMatrix * vec4(aPosition, 1.0);
}
