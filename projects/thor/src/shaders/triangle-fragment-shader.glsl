#version 300 es

precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;

uniform float uTime;

in vec2 vUv;
in vec3 vColor;

out vec4 fragColour;

void main() {
  vec3 textureColor = texture(uTexture, vUv).rgb;

  // Only sample one channel since the noise texture is grayscale
  float noise = texture(uNoiseTexture, 0.5 * vUv.xy + vec2(uTime * 0.1)).r;

  fragColour = vec4(textureColor * vColor * noise, 1.0);
}
