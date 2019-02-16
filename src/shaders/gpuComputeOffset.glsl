uniform bool      uEmit;
uniform float     uDeltaT;
uniform float     uParticleSpeed;
uniform float     uSphereRadius;
uniform float     uTexBatchHeight;
uniform sampler2D uSphere;

void main(){
	vec2 uv=gl_FragCoord.xy/resolution.xy;

	// Variant #1
	// float i=resolution.y-gl_FragCoord.y;
	// if(i<=uTexBatchHeight){
	// 	uv.y=i/uTexBatchHeight;
	// 	gl_FragColor=vec4(texture2D(uSphere,uv).xyz*uSphereRadius,0);
	// }
	// else{
	// 	if(uEmit) uv.y=(gl_FragCoord.y+uTexBatchHeight)/resolution.y;
	// 	gl_FragColor=texture2D(offset,uv)+vec4(texture2D(direction,uv).xyz*uDeltaT*uParticleSpeed,uDeltaT);
	// }

	// Variant #2
	if(gl_FragCoord.y<=uTexBatchHeight){
		uv.y=gl_FragCoord.y/uTexBatchHeight;
		gl_FragColor=vec4(texture2D(uSphere,uv).xyz*uSphereRadius,0);
	}
	else{
		if(uEmit) uv.y=(gl_FragCoord.y-uTexBatchHeight)/resolution.y;
		gl_FragColor=texture2D(offset,uv)+vec4(texture2D(direction,uv).xyz*uDeltaT*uParticleSpeed,uDeltaT);
	}
}
