// TODO
// Icon
// Try lines over dots

const colors={
	blue   :new Float32Array([.1,.3,1]),
	green  :new Float32Array([.375,1,.075]),
	orange :new Float32Array([1,.225,.1]),
	red    :new Float32Array([1,.1375,.05]),
	violet :new Float32Array([.2,.1,1]),
	yellow :new Float32Array([1,.5,.1]),
	aqua   :new Float32Array([.1,1,.375]),
}

gpgpuTexWidth   =1*getUrlParam('gpgpuTexWidth')
spherePointCount=1*getUrlParam('spherePointCount')
particleLifetime=1*getUrlParam('particleLifetime') // Sec
emitFrequency   =1*getUrlParam('emitFrequency')    // Emits per sec

color          =  getUrlParam('color')
curliness      =1*getUrlParam('curliness')
fadeHardness   =1*getUrlParam('fadeHardness')
particleSize   =1*getUrlParam('particleSize')
particleSpeed  =1*getUrlParam('particleSpeed')
particleOpacity=1*getUrlParam('particleOpacity')
reactiveness   =1*getUrlParam('reactiveness')
sphereRadius   =1*getUrlParam('sphereRadius')
windX          =1*getUrlParam('windX')
windY          =1*getUrlParam('windY')
windZ          =1*getUrlParam('windZ')

// Compile time parameters
gpgpuTexWidth   ||(gpgpuTexWidth    =1024  )
spherePointCount||(spherePointCount =1024*3)
particleLifetime||(particleLifetime =2     ) // Sec
emitFrequency   ||(emitFrequency    =2.5   ) // Emits per sec

// NOTE:
// - gpgpuTexWidth must be a power of 2 (for performance)
// - spherePointCount must be a multiple of gpgpuTexWidth
// - particleLifetime*emitFrequency must be a whole number

// Run time parameters
color          ||(color           ='orange')
curliness      ||(curliness       =.65     )
fadeHardness   ||(fadeHardness    =1       )
particleSize   ||(particleSize    =.025    )
particleSpeed  ||(particleSpeed   =2       )
particleOpacity||(particleOpacity =.875    )
reactiveness   ||(reactiveness    =.15     )
sphereRadius   ||(sphereRadius    =.75     )
windX          ||(windX           =0       )
windY          ||(windY           =1.25    )
windZ          ||(windZ           =0       )

// Initializing Constants
const rendererEle        =document.getElementById('renderer')
const batchCount         =particleLifetime*emitFrequency // Particle are emitted in 'batches'
const particleCount      =spherePointCount*particleLifetime*emitFrequency
const gpgpuTexBatchHeight=spherePointCount/gpgpuTexWidth
const gpgpuTexHeight     =gpgpuTexBatchHeight*batchCount
const emitInterval       =1/emitFrequency
const wind               =new Float32Array([windX,windY,windZ])

// Setup dat.gui
let gui
const setupGui=()=>{
	gui=new dat.GUI()

	const color_           =gui.add(window,'color',Object.keys(colors)).name('Color').onChange(v=>uniforms.uColor.value=colors[v])
	const curliness_       =gui.add(uniforms.uCurliness,'value',0,1).name('Curliness').step(.01)
	const fadeHardness_    =gui.add(uniforms.uFadeHardness,'value',1,batchCount).name('Fade Hardness').step(.01)
	const particleSize_    =gui.add(uniforms.uParticleSize,'value',0,.1).name('Particle Size').step(.005)
	const particleSpeed_   =gui.add(uniforms.uParticleSpeed,'value',0,3).name('Particle Speed').step(.01)
	const particleOpacity_ =gui.add(uniforms.uParticleOpacity,'value',0,1).name('Opacity').step(.01)
	const reactiveness_    =gui.add(uniforms.uReactiveness,'value',0,2).name('Reactiveness').step(.01)
	const sphereRadius_    =gui.add(uniforms.uSphereRadius,'value',0,2).name('Sphere Radius').step(.01)
	const windX_           =gui.add(uniforms.uWind.value,'0',-2,2).name('Wind X').step(.005)
	const windY_           =gui.add(uniforms.uWind.value,'1',-2,2).name('Wind Y').step(.005)
	const windZ_           =gui.add(uniforms.uWind.value,'2',-2,2).name('Wind Z').step(.005)

	gui.close()
}
