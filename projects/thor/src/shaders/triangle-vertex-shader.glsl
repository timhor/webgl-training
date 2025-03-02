#version 300 es

#define PI 3.14159265359

in vec3 aPosition;
in vec2 aUv;

uniform mat4 uViewProjectionMatrix;

// out float vGradientAmount;
// out vec3 vPosition;
out vec2 vUv;

void main() {
  // float angle = sin(uTime) * 30.0;
  // float angleRadians = angle * PI / 180.0;
  // mat2 rotate = mat2(cos(angleRadians), -sin(angleRadians), sin(angleRadians), cos(angleRadians));

  // Add offset so we work with 0 -> 1 range
  // vGradientAmount = (aPosition.xy * rotate).x + 0.5;

  // vPosition = aPosition;
  // Using a multiplier makes the image appear twice as big since the respective
  // coordinates are halved, meaning less of the texture is shown
  vUv = aUv;

  gl_Position = uViewProjectionMatrix * vec4(aPosition, 1.0);
}
