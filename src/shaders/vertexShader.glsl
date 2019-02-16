attribute vec2 aIndex;

uniform float     uFadeHardness;
uniform float     uOpacity;
uniform float     uParticleSize;
uniform float     uParticleOpacity;
uniform sampler2D uDirection;
uniform sampler2D uOffset;
uniform sampler2D uSphere;

varying float vOpacity;

void main(){
	vec4 pos=texture2D(uOffset,aIndex);
	vOpacity=min(1.,(1.-pos.w/uOpacity)*uFadeHardness)*uParticleOpacity;
	gl_Position=projectionMatrix*(modelViewMatrix*vec4(pos.xyz,1)+vec4(position*uParticleSize*vOpacity,1));
}
