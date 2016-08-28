var config = {
	// *
	// CONFIG
	// -------------- // 
	number: 20, // number of objects
	boundaries: 20, // example: 20 means position = THREE.Math.randInt(-20,20)
	size: 3, // object size
	// -------------- //
	kaleidoscope: true,
	sides: 7, // number of kaleidoscope sides
	angle: 45, // kaleidoscope angle, in degrees
	// -------------- //
	colorshift: true, // RGB color shift shader filter
	flatshading: true, // flat or smooth shading
	wireframe: false // wireframe mode
	// -------------- //
};

// init variables
var renderer, scene, camera, composer, 
	geometry, material, mesh, group, 
	light, animation;

// run
init();
animate();

// initialize scene
function init() {
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize( window.innerHeight, window.innerHeight );
	document.body.appendChild( renderer.domElement );
		
	geometry = new THREE.IcosahedronGeometry(config.size,0);
	geometry.computeFaceNormals();
	// note: if you want to use specific colors, change MeshNormalMaterial
	// to MeshLambertMaterial and set the color and emissive properties. 
	// http://threejs.org/docs/#Reference/Materials/MeshLambertMaterial
	material = new THREE.MeshNormalMaterial({
		wireframe: config.wireframe,
		//wireframeLinewidth: 6,
		shading: config.flatshading ? THREE.FlatShading : THREE.SmoothShading
	});
	
	group = new THREE.Object3D();
	
	for (var i=0;i<config.number;i++) {
		
		mesh = new THREE.Mesh(geometry, material);
		var b = config.boundaries;
		mesh.position.set(
			THREE.Math.randInt(-b,b),
			THREE.Math.randInt(-b,b),
			THREE.Math.randInt(-b,b)
		)
		
		group.add(mesh);
		
	}
	
	scene.add(group);

	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(0,0,250);
	scene.add(light);

	camera.position.set(0,0,40); 
	
	// postprocessing
	if (config.kaleidoscope || config.colorshift) {
		// support transparency thanks to http://codepen.io/SephReed/pen/jWWEQE
		var renderTarget = new THREE.WebGLRenderTarget(
			window.innerHeight,
			window.innerHeight,
			{
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.LinearFilter, 
				format: THREE.RGBAFormat, 
				stencilBuffer: false 
			}
		);

		composer = new THREE.EffectComposer(renderer, renderTarget);
		composer.addPass(new THREE.RenderPass(scene, camera));		
	}

	if (config.kaleidoscope) {
		var effect = new THREE.ShaderPass(THREE.KaleidoShader);
		effect.uniforms['sides'].value = config.sides;
		effect.uniforms['angle'].value = config.angle * Math.PI / 180;
		composer.addPass(effect);
	}
	
	if (config.colorshift) {
		var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
		effect.uniforms['amount'].value = 0.005;
		composer.addPass(effect);
	}
	
	if (config.kaleidoscope || config.colorshift) {
		effect.renderToScreen = true;
	}
			
}

// animate
function animate() {
	animation = requestAnimationFrame(animate);

	group.rotation.x += 0.001;
	group.rotation.y += 0.001;
	group.rotation.z += 0.001;

	render();
}

function destroy() {
	cancelAnimationFrame(animate);
	
}
	
// render
function render() {
	if (config.kaleidoscope || config.colorshift) {
		composer.render();	
	} else {
		renderer.render(scene, camera);
	}
}

// handle window resize
window.addEventListener('resize', function(e) {

	// Adjust the camera as normal
	camera.updateProjectionMatrix();
	
	renderer.setSize(window.innerHeight, window.innerHeight);

}, false);

function openclose() {
	var config_panel = document.querySelector('#config');
	event.preventDefault();
	if (config_panel.classList == 'closed') {
		config_panel.classList.remove('closed');
		config_panel.classList.add('open');
	} else {
		config_panel.classList.remove('open');
		config_panel.classList.add('closed');
	}
}

function opts() {
	if (event.target.type == 'checkbox') {
		config[event.target.id] = event.target.checked
	} else {
		config[event.target.id] = Number(event.target.value)
	}
	document.querySelector('body').removeChild(document.querySelector('canvas'));
	init();
}

function background() {
	var body = document.querySelector('body');
	event.preventDefault();
	if (body.classList == 'space') {
		body.classList.remove('space');
	} else {
		body.classList.add('space');
	}

}