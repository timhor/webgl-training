#version 300 es

precision highp float;

// Input variable that defines which texture sampler to use
uniform sampler2D uTexture;

// The texture coordinate of the fragment being processed, passed from the vertex shader.
// The GPU will interpolate this value across the surface of the triangle
// automatically for us.
in vec2 vUv;

// The output colour of the fragment shader that will be rendered to the screen
out vec4 fragColour;

void main() {
  // Sample the texture at the given texture coordinate. This is a bit like
  // reading a value from a 2D array, where the texture is the array and the UV
  // coordinate is the index.
  vec3 colour = texture(uTexture, vUv.xy).rgb;

  fragColour = vec4(colour, 1.0);
}
