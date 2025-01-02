#version 300 es

#define PI 3.14159265359

precision highp float;

// Start and end of gradient
uniform vec3 uColour1;
uniform vec3 uColour2;

uniform float uTime;

in float vGradientAmount;

out vec4 fragColour;

void main() {
  float gradientAmount = vGradientAmount + uTime;
  // Multiply by 2*PI so the cycle repeats every 1 unit along the x-axis
  gradientAmount = (-cos((gradientAmount) * 2.0 * PI) + 1.0) / 2.0;

  vec3 finalColour = mix(uColour1, uColour2, gradientAmount);

  fragColour = vec4(finalColour, 1.0);
}
