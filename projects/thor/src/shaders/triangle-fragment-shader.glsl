#version 300 es

// #define PI 3.14159265359

precision highp float;

// Start and end of gradient
// uniform vec3 uColour1;
// uniform vec3 uColour2;

uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;

uniform float uTime;

// in float vGradientAmount;
// in vec3 vPosition;
in vec2 vUv;

out vec4 fragColour;

void main() {
  // float gradientAmount = vGradientAmount + uTime;
  // Multiply by 2*PI so the cycle repeats every 1 unit along the x-axis
  // gradientAmount = (-cos((gradientAmount) * 2.0 * PI) + 1.0) / 2.0;

  vec3 textureColor = texture(uTexture, vUv).rgb;

  // Only sample one channel since the noise texture is grayscale
  float noise = texture(uNoiseTexture, 0.5 * vUv.xy + vec2(uTime * 0.1)).r;

  // vec3 finalColour = mix(uColour1, uColour2, gradientAmount);

  fragColour = vec4(textureColor * noise, 1.0);
}
