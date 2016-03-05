

var clock = new THREE.Clock();

var scene, camera, renderer;
var raycaster, mouse, selectedObject;

//initGraph();
// animate();

var nodes, edges, jsonReport;

function onDocumentMouseDown( event ) {

    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( scene.children );
        // Change color if hit block
        if ( intersects.length > 0 ) {
            // intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
            intersects.forEach(function(element,index){
            	if(element.object.userData.info != undefined && element.object != undefined){
            		// console.log(element.object);
            		console.log(element.object.userData.info);
                //Set back to default colors
                if(selectedObject != element && selectedObject != undefined){
                  selectedObject.object.material.color.setHex(0xffffff);
                  //Lines color
                  selectedObject.object.userData.info.links.forEach(function(line){
                    line.material.color.setHex(0xffffff);
                    line.material.opacity = 0.15;
                    line.material.linewidth = 0.8;
                  });
                }
                //Sphere color
                element.object.material.color.setHex(0xcc00cc);
                //Lines color
                element.object.userData.info.links.forEach(function(line){
                  line.material.color.setHex(0xcc00cc);
                  line.material.opacity = 1.0;
                  line.material.linewidth = 1.5;
                });
                showNodeDetails(element.object.userData.info);
                selectedObject = element;
            		return;
            	}
            });
            //console.log(intersects[0].object.userData.info);
        }
        //console.log(event);
}
function onDocumentMouseMove( event ) {

      // hoveredObject.object.material.color.setHex(0xffffff);
    nodes.forEach(function( sphere ) {
      if(selectedObject != undefined){
        if(selectedObject.object != sphere){
            sphere.material.color.setHex( 0xffffff);
        }
      }else{
        sphere.material.color.setHex( 0xffffff);
      }

    });

    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( scene.children );
        // Change color if hit block
        if ( intersects.length > 0 ) {
            // intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
            intersects.forEach(function(element,index){
            	if(element.object.userData.info != undefined && element.object != undefined){
            		// console.log(element.object);
                element.object.material.color.setHex(0xcc00cc);
            		return;
            	}
            });
            //console.log(intersects[0].object.userData.info);
        }
        //console.log(event);
}
// Our Javascript will go here.
function initGraph(scrappedJson){
  // $('body').removeAttr("overflow");
  // $('html').removeAttr("overflow");
  $('#landingPage').hide();
  container = document.getElementById("entireWebsiteContainer");
  // $(container).empty();

	// container = document.createElement( 'div' );
	// document.body.appendChild( container );

	scene = new THREE.Scene();
	scene.fog=new THREE.Fog( 0x00000, 0, 6000 );
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 8000 );
		camera.position.z = 3000;
		camera.position.y = 10;
		camera.position.x = 0;


	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	container.appendChild( renderer.domElement );


	//MOUSE CLICKS
	raycaster = new THREE.Raycaster(); // create once
	mouse = new THREE.Vector2(); // create once

	//CONTROLS
	controls = new THREE.FlyControls( camera, container ); //For textboxes in HTMl to work
		controls.movementSpeed = 400;
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

	//LOAD THE JSON with all the Nodes and Edges data
  jsonReport = JSON.parse(scrappedJson);
	// loadJSON(function(response) {
	//   // Parse JSON string into object
	//     jsonReport = JSON.parse(response);
  //

  //  Nodes must be created first.
	    createNodes();
	    createEdges();
	//  });

  render();

}

function createNodes(){
	nodes = [];

	for(var i = 0; i < jsonReport.nodes.length ; i++){
		var nodeSize = 10;//Math.ceil((Math.random() * 100));
		if(jsonReport.nodes[i].unixtime < -5333097500)
			nodeSize = 40;

      //This should be optimized.. this info should be processed in the scrapper instead of here.
      var nodeReferencesCount = 0;
      jsonReport.links.forEach(function(li){
        if(li.source_id == jsonReport.nodes[i].id){
          nodeReferencesCount++;
        }
      });
      nodeSize = nodeSize + nodeReferencesCount;//(nodeReferencesCount * 0.2);
	    var nodeGeometry = new THREE.SphereGeometry(nodeSize,30,30);
      var nodeMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color( 0xffffff ), wireframe: true, wireframeLinewidth: 2.0, fog: true});


      var node = new THREE.Mesh(nodeGeometry, nodeMaterial);


	    node.position.x= Math.random() * 2000 - 1000;
	    node.position.y= jsonReport.nodes[i].unixtime  * 0.00001 * 0.1;//* 0.000001 * 0.2;
	    node.position.z= Math.random() * 2000 - 1000;

		  node.userData.info = jsonReport.nodes[i];
      node.userData.info.links = [];
      node.userData.info.related = [];
	    nodes.push(node);
	    scene.add(node);
	}
}

function createEdges(){
	edges = [];
	for(var i = 0; i < jsonReport.links.length ; i++){
		var line_segment = new THREE.Geometry();
		line_segment.vertices.push( new THREE.Vector3(	nodes[jsonReport.links[i].source].position.x,
														nodes[jsonReport.links[i].source].position.y,
														nodes[jsonReport.links[i].source].position.z ) );
		line_segment.vertices.push( new THREE.Vector3( 	nodes[jsonReport.links[i].target].position.x,
														nodes[jsonReport.links[i].target].position.y,
														nodes[jsonReport.links[i].target].position.z ) );
		var line = new THREE.Line( line_segment,
	                            new THREE.LineBasicMaterial( { color: 0xffffff,//Math.random() * 0xffffff,
	                            							   linewidth: 0.8,
	                            							   linecap: "round",
	                                                           opacity: 0.15,
	                                                           transparent: true } ) );

    nodes[jsonReport.links[i].source].userData.info.links.push(line); // Saving its links objects
    nodes[jsonReport.links[i].source].userData.info.related.push(nodes[jsonReport.links[i].target]); //Saving it's related object Meshes
		edges.push(line);
	 	scene.add(line);

	}


}

function showNodeDetails(nodeData){
    detailsPanel.slideReveal("show");
    detailsPanel.innerHTML = nodeData.name;
    var htmlText = nodeData.name + "<br><br>" +
                      nodeData.author + "<br><br>" +
                      nodeData.date + "<br><br> Related:<br>";

    for(var i=0; i<nodeData.related.length; i++){
      htmlText = htmlText + "- "+ nodeData.related[i].userData.info.name + " [" +nodeData.related[i].userData.info.date + "] <br><br>";
    }

    detailsPanel.html(htmlText);




}
// function animate(){

// 	requestAnimationFrame( animate );
// 	render();
// 	update();
// }

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'output.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }


function render() {
	var delta = clock.getDelta();
	var time = Date.now() * 0.00005;

  	controls.update( delta );
  	requestAnimationFrame( render );
	renderer.render( scene, camera );
}


// render();
