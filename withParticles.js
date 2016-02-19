var clock = new THREE.Clock();

var scene, camera, renderer;

init();
// animate();

var nodes;
var allNodesObject;
// Our Javascript will go here.
function init(){
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();
	scene.fog=new THREE.Fog( 0x00000, 0, 3000 );
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 80;
		camera.position.y = 10;
		camera.position.x = 0;

	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//CONTROLS
	controls = new THREE.FlyControls( camera, container ); //For textboxes in HTMl to work
		controls.movementSpeed = 80;
		controls.domElement = container;
		controls.rollSpeed =  0.5;//Math.PI / 24;
		controls.autoForward = false;
		controls.dragToLook = true;
	//controls.target.set( 0, 0, 0 );

	//GRID HELPER
	var helper = new THREE.GridHelper(100, 5 );
		helper.setColors( 0x0000ff, 0x808080 );
		helper.position.y = 0;
	scene.add( helper );

	// Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function() {
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });
	
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,250,100);
	scene.add(light);

	
	createNodes();
	
}

function createNodes(){
	nodes = [];
	
	for(var i = 0; i < 1000 ; i++){
		var nodeSize = 5;//Math.ceil((Math.random() * 100));
	    var nodeGeometry = new THREE.Geometry(); //new THREE.SphereGeometry(nodeSize,30,30);
	    var nodeMaterial = new THREE.PointsMaterial({color: 0xFFFFFF, size: nodeSize});//new THREE.MeshNormalMaterial();
	    //var node = new THREE.Mesh(nodeGeometry, nodeMaterial);
	    
	    var nodeParticle = new THREE.Vector3();
	    nodeParticle.x= Math.random() * 1000 - 500;
	    nodeParticle.y= 50;
	    nodeParticle.z= Math.random() * 1000 - 500;
	    
	    nodeGeometry.vertices.push(nodeParticle);
	    
	    // node.position.x= Math.random() * 1000 - 500;
	    // node.position.y= 50;
	    // node.position.z= Math.random() * 1000 - 500;
	    allNodesObject = new THREE.Points(nodeGeometry, nodeMaterial);
	    allNodesObject.sortParticles = true;

	    nodes.push(nodeParticle);
	    scene.add(allNodesObject);
	}

	


}


// function animate(){

// 	requestAnimationFrame( animate );
// 	render();		
// 	update();
// }




function render() {
	var delta = clock.getDelta();
	var time = Date.now() * 0.00005;


	// var pCount = nodes.length-1;
 //    while (pCount--)
 //    {
 //        var particle = nodes[pCount];
 //        particle.y = Math.random() * 500 - 250;
 //        particleSystem.geometry.vertices.needsUpdate = true;
 //    }

	nodes[Math.ceil(Math.random() * 800)].y += 10;;
	allNodesObject.geometry.vertices.needsUpdate = true;
	console.log(nodes[0]);

	// flag to the particle system that we've changed its vertices.
 //    particleSystem.geometry.verticesNeedUpdate = true;
	
	// particleSystem.rotation.y += 0.005; //rotate the obj

	

	// for (i = 0 ; i< particleCount ; i++){
		
	// 	// console.log(sign);
	// 	var particle = particleSystem.geometry.vertices[i];
	// 	if (particle.sign > 0){
	// 		particle.y += Math.sin(clock.elapsedTime)*0.10;
	// 	}else{
	// 		particle.y += Math.sin(clock.elapsedTime)*0.10 * -1;
	// 	}
			
			
		
	// }

	// cube.rotation.x += 0.1;
	// cube.rotation.y += 0.03;

	// cube.position.y = Math.sin(clock.elapsedTime)*5.5;
	// cube.position.x = Math.sin(clock.elapsedTime)*5.5;
	// cube.position.z = Math.sin(clock.elapsedTime)*5.5;
	//console.log(cube.position.x);

 //  	for ( i = 0; i < scene.children.length; i ++ ) {

	// 				var object = scene.children[ i ];

	// 				if ( object instanceof THREE.PointCloud ) {

	// 					object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

	// 				}

	// 			}
	// for ( i = 0; i < materials.length; i ++ ) {

	// 	color = parameters[i][0];

	// 	h = ( 360 * ( color[0] + time ) % 360 ) / 360;
	// 	materials[i].color.setHSL( h, color[1], color[2] );

	// }

	

  	controls.update( delta );
  	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
render();
