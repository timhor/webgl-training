#version 300 es

precision highp float;

uniform vec3 uColour;
out vec4 fragColour;

void main() {
  fragColour = vec4(uColour, 1.0);
}
