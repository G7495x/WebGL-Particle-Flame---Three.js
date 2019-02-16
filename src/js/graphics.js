const renderer=new THREE.WebGLRenderer({
	antialias:             true,
	canvas:                rendererEle,
	alpha:                 true,
	preserveDrawingBuffer: true,
})

const scene=new THREE.Scene()
const camera=new THREE.PerspectiveCamera()
camera.position.set(12.5,0,-12.5)
camera.lookAt(0,0,0)
// const controls=new THREE.OrbitControls(camera,rendererEle)

const setupRenderer=()=>{
	let viewportWidth=document.body.offsetWidth
	let viewportHeight=document.body.offsetHeight
	let aspectRatio=viewportWidth/viewportHeight

	renderer.setSize(viewportWidth,viewportHeight)
	renderer.setPixelRatio(window.devicePixelRatio)

	// Universal desktop and mobile friendly FOV algorithm
	camera.fov=45*(aspectRatio>1?1:Math.atan(1/aspectRatio)/piBy180/45)
	camera.aspect=aspectRatio
	camera.updateProjectionMatrix()
}
setupRenderer()
window.addEventListener('resize',()=>{ setupRenderer() },true)

const spherePoints=fibonacciSpherePoints(spherePointCount) // Fibonacci Sphere point positions
const sphereTexture=new THREE.DataTexture(                 // spherePoints[] as a texture for shaders
	spherePoints,
  gpgpuTexWidth,
  gpgpuTexBatchHeight,
	THREE.RGBFormat,
	THREE.FloatType,
)
sphereTexture.needsUpdate=true

const uniforms={
	uColor           :{ value: colors[color]        },
	uCurliness       :{ value: curliness            },
	uDeltaT          :{ value: 0                    },
	uDirection       :{ value: null                 },
	uEmit            :{ value: true                 },
	uFadeHardness    :{ value: fadeHardness         },
	uOffset          :{ value: null                 },
	uOpacity         :{ value: .75*particleLifetime },
	uParticleSize    :{ value: particleSize         },
	uParticleSpeed   :{ value: particleSpeed        },
	uParticleOpacity :{ value: particleOpacity      },
	uReactiveness    :{ value: reactiveness         },
	uSphere          :{ value: sphereTexture        },
	uSphereRadius    :{ value: sphereRadius         },
	uTexBatchHeight  :{ value: gpgpuTexBatchHeight  },
	uTime            :{ value: 0                    },
	uWind            :{ value: wind                 },
}

// GPGPU - Perform Calculations in GPU & output as texture
const gpuCompute=new GPUComputationRenderer(gpgpuTexWidth,gpgpuTexHeight,renderer)

// Shaders for computing particle positions(offsets),directions
const offsetShader=httpGetText(document.getElementById('gpuComputeOffset').src)
const directionShader=httpGetText(document.getElementById('gpuComputeDirection').src)

// Texture outputs for particle positions(offsets),directions
const offsets=gpuCompute.addVariable('offset',offsetShader,gpuCompute.createTexture())
const directions=gpuCompute.addVariable('direction',directionShader,gpuCompute.createTexture())

offsets.material.uniforms=uniforms
directions.material.uniforms=uniforms

gpuCompute.setVariableDependencies(directions,[offsets])
gpuCompute.setVariableDependencies(offsets,[offsets,directions])

const gpuComputeError=gpuCompute.init()
if(gpuComputeError) console.error(gpuComputeError)

uniforms.uOffset.value=gpuCompute.getCurrentRenderTarget(offsets).texture
uniforms.uDirection.value=gpuCompute.getCurrentRenderTarget(directions).texture

const triangleVertices=new Float32Array([
	 0                 , 1  ,0,
	-0.8660254037844387,-0.5,0,
	 0.8660254037844387,-0.5,0,
])
const faces=[0,1,2]
const geometry=new THREE.InstancedBufferGeometry()
geometry.addAttribute('position',new THREE.Float32BufferAttribute(triangleVertices,3))
geometry.setIndex(faces)

const indices=new Float32Array(particleCount*2)
for(let i=0,j=0;i<particleCount;++i){
  indices[j++]=(i%gpgpuTexWidth+.5)/gpgpuTexWidth
  indices[j++]=(Math.floor(i/gpgpuTexWidth)+.5)/gpgpuTexHeight
}
geometry.addAttribute('aIndex',new THREE.InstancedBufferAttribute(indices,2))
geometry.maxInstancedCount=particleCount

const material=new THREE.ShaderMaterial({
	vertexShader: httpGetText(document.getElementById('vertexShader').src),
	fragmentShader: httpGetText(document.getElementById('fragmentShader').src),
	blending: THREE.AdditiveBlending,
	transparent: true,
	depthTest: false,
	depthWrite: false,
})
material.wireframe=true
material.uniforms=uniforms

const particles=new THREE.Mesh(geometry,material)
particles.position.y=-2.5
particles.rotation.z=-25*piBy180
scene.add(particles)

const start=new Date().getTime()/1000 // Timestamp of start
let then=new Date().getTime()/1000    // Timestamp of last frame
let prevBatch=-1                      // Batch of last frame
let time=0                            // Time since start

const graphicsUpdate=()=>{
	const now=new Date().getTime()/1000
	const deltaT=now-then
	time+=deltaT
	const batch=Math.floor(time%particleLifetime*emitFrequency)

	uniforms.uEmit.value=batch!=prevBatch
	uniforms.uDeltaT.value=deltaT

	// uniforms.uTime.value=time
	// uniforms.uTime.value=20+5*Math.sin(time/5)
	// uniforms.uTime.value=101+2*Math.sin(time/5)
	uniforms.uTime.value=168.5+1.5*Math.sin(time/5)
	// uniforms.uTime.value=195+5*Math.sin(time/5)

	gpuCompute.compute()
	renderer.render(scene,camera)

	then=now
	prevBatch=batch
}

const shadow=new THREE.Mesh(
	new THREE.SphereBufferGeometry(1,50,50),
	new THREE.MeshBasicMaterial({ color: new THREE.Color('hsl(210,10%,15%)') })
)
shadow.scale.set(.25,.025,.5)
shadow.position.y=-4.25
shadow.rotation.y=45*piBy180
scene.add(shadow)
