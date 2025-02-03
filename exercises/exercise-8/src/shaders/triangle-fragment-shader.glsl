#version 300 es

precision highp float;

// Input variables that defines which texture samplers to use
uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;

// The current time, used for animating the noise texture
uniform float uTime;

// The texture coordinate of the fragment being processed, passed from the vertex shader.
// The GPU will interpolate this value across the surface of the triangle
// automatically for us.
in vec2 vUv;

// The output colour of the fragment shader that will be rendered to the screen
out vec4 fragColour;

void main() {
  // Sample the colour texture
  vec3 colour = texture(uTexture, vUv.xy).rgb;

  // Sample the noise texture, animating its position over time
  vec2 noiseTexCoordOffset = vec2(uTime * 0.025);
  float noiseTextCoordScale = 0.5;
  float noise = texture(
    uNoiseTexture,
    vUv.xy * noiseTextCoordScale + noiseTexCoordOffset
  ).r;

  // Make the noise more intense by adding to it and raising it to a power
  noise = pow(noise + 0.46, 8.0);

  fragColour = vec4(colour * noise, 1.0);
}
