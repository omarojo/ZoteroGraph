var clock = new THREE.Clock();

var scene, camera, renderer;
var sceneOrtho, cameraOrtho;
var raycaster, mouse, selectedObject, highlightedObject;
var settingsObject, gui;
var DEFAULT_COLOR = 0xffffff;
var SELECTED_COLOR = 0xcc00cc;
var FILTERED_COLOR = 0xffff66;
var HIGHLIGHTED_COLOR = 0xcc00cc;

//initGraph();
// animate();

var nodes, edges, jsonReport;

var GlassCastSettings = function(json) {
  this.category = "ALL"; //["A","B","C","D"];
  this.subCategory = "ALL";
};
function onDocumentMouseDown(event) {
  mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);
  // Change color if hit block
  if (intersects.length > 0) {
    // intersects[ 0 ].object.material.color.setHex( Math.random() * DEFAULT_COLOR );
    intersects.forEach(function(element, index) {
      if (
        element.object.userData.info != undefined &&
        element.object != undefined
      ) {
        //console.log(element.object.userData.info);

        //Set back to default colors
        if (selectedObject != element && selectedObject != undefined) {
          selectedObject.object.material.color.setHex(DEFAULT_COLOR);
          if (selectedObject.object.userData.info.filterColor != undefined) {
            selectedObject.object.material.color.setHex(
              selectedObject.object.userData.info.filterColor
            );
          }
          //Lines color
          selectedObject.object.userData.info.links.forEach(function(line) {
            line.material.color.setHex(DEFAULT_COLOR);
            line.material.opacity = 0.15;
            line.material.linewidth = 0.8;
          });
        }
        //Sphere color
        element.object.material.color.setHex(SELECTED_COLOR);
        //Lines color
        element.object.userData.info.links.forEach(function(line) {
          line.material.color.setHex(SELECTED_COLOR);
          line.material.opacity = 1.0;
          line.material.linewidth = 1.5;
        });
        showNodeDetails(element.object.userData.info);
        selectedObject = element;
        console.log(selectedObject.object.userData.info);
        return;
      }
    });
    //console.log(intersects[0].object.userData.info);
  }
  //console.log(event);
}
function onDocumentMouseMove(event) {
  // hoveredObject.object.material.color.setHex(DEFAULT_COLOR);
  // nodes.forEach(function( sphere ) {
  //   if(selectedObject != undefined){
  //     if(selectedObject.object != sphere){
  //    //     sphere.material.color.setHex( DEFAULT_COLOR); //Lines
  //     }
  //   }
  //   else{
  //     sphere.material.color.setHex( DEFAULT_COLOR); //Nodes
  //   }

  // });
  if (highlightedObject != undefined) {
    if (selectedObject != undefined) {
      if (
        highlightedObject.object.userData.info.id !=
        selectedObject.object.userData.info.id
      ) {
        //only color gray if its not the selected one
        highlightedObject.object.material.color.setHex(DEFAULT_COLOR);
        if (highlightedObject.object.userData.info.filterColor != undefined) {
          highlightedObject.object.material.color.setHex(
            highlightedObject.object.userData.info.filterColor
          );
        }
      }
    } else {
      highlightedObject.object.material.color.setHex(DEFAULT_COLOR);
      if (highlightedObject.object.userData.info.filterColor != undefined) {
        highlightedObject.object.material.color.setHex(
          highlightedObject.object.userData.info.filterColor
        );
      }
    }
  }

  mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);
  // Change color if hit block
  if (intersects.length > 0) {
    // intersects[ 0 ].object.material.color.setHex( Math.random() * DEFAULT_COLOR );
    for (var i = 0; i < intersects.length; i++) {
      var element = intersects[i];
      if (
        element.object.userData.info != undefined &&
        element.object != undefined
      ) {
        // console.log(element.object);
        element.object.material.color.setHex(HIGHLIGHTED_COLOR);
        highlightedObject = element;
        //console.log(highlightedObject.object.userData.info);
        showNodeToolTip(element.object.userData.info);
        break;
      } else {
        //clear tooltip
        $.powerTip.hide();
      }
    }
  } else {
    $.powerTip.hide();
  }
  //console.log(event);
}

// Our Javascript will go here.
function initGraph(scrappedJson) {
  // $('body').removeAttr("overflow");
  // $('html').removeAttr("overflow");
  $("#landingPage").hide();
  container = document.getElementById("entireWebsiteContainer");
  // $(container).empty();

  // container = document.createElement( 'div' );
  // document.body.appendChild( container );

  //SCENES
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x00000, 0, 6000);

  //CAMERAS
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    8000
  );
  camera.position.z = 3000;
  camera.position.y = 10;
  camera.position.x = 0;

  //RENDERER
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
  renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
  container.appendChild(renderer.domElement);

  //MOUSE CLICKS
  raycaster = new THREE.Raycaster(); // create once
  mouse = new THREE.Vector2(); // create once

  //CONTROLS
  controls = new THREE.FlyControls(camera, container); //For textboxes in HTMl to work
  controls.movementSpeed = 400;
  controls.domElement = container;
  controls.rollSpeed = 0.5; //Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = true;
  //controls.target.set( 0, 0, 0 );

  //GRID HELPER
  var helper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
  helper.position.y = 0;
  scene.add(helper);

  // Create an event listener that resizes the renderer with the browser window.
  window.addEventListener("resize", function() {
    var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  // LIGHT
  var light = new THREE.PointLight(DEFAULT_COLOR);
  light.position.set(100, 250, 100);
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

  //Create Settings object
  settingsObject = new GlassCastSettings(jsonReport);
  gui = new dat.GUI({ width: 600 });
  var catNamesOnly = [];
  for (var key in jsonReport.categories) {
    if (jsonReport.categories.hasOwnProperty(key)) {
      catNamesOnly.push(key);
    }
  }
  catNamesOnly.unshift("ALL");
  var guiCatController = gui.add(settingsObject, "category", catNamesOnly);

  gui.__controllers[0].__select.selectedIndex = 0;

  var guiSubCatController = gui.add(settingsObject, "subCategory", ["ALL"]);

  guiCatController.onChange(function(value) {
    // console.log(value);
    // settingsObject.subCategory = jsonReport.categories[value];
    guiSubCatController.remove();
    if (jsonReport.categories[value] == undefined) {
      guiSubCatController = gui.add(settingsObject, "subCategory", ["ALL"]);
      gui.__controllers[1].__select.selectedIndex = 0;
      settingsObject.subCategory = "ALL";
    } else {
      var subCats = jsonReport.categories[value];
      subCats.unshift("ALL");
      guiSubCatController = gui.add(settingsObject, "subCategory", subCats);
      gui.__controllers[1].__select.selectedIndex = 0;
      settingsObject.subCategory = "ALL";
    }
    guiSubCatController.onChange(function(subCatValue) {
      //console.log(subCatValue);
      dyeNodesForFilter();
    });
    dyeNodesForFilter();
  });

  render();
}

function dyeNodesForFilter() {
  console.log(settingsObject.subCategory);
  console.log(settingsObject.category);

  var selectedCat = settingsObject.category;
  var selectedSubCat = settingsObject.subCategory;

  //Clean
  nodes.forEach(function(sphere) {
    sphere.userData.info.filterColor = null;
    sphere.material.color.setHex(DEFAULT_COLOR);
  });

  if (selectedCat == "ALL") {
    //when selectedCat is ALL, selectedSubCat is also ALL
    nodes.forEach(function(sphere) {
      sphere.userData.info.filterColor = null;
      sphere.material.color.setHex(DEFAULT_COLOR);
    });
  } else {
    var tempRandomColor =
      "0x" + Math.floor(Math.random() * 16777215).toString(16);
    nodes.forEach(function(sphere) {
      if (
        sphere.userData.info.categories[selectedCat] != "-" &&
        selectedSubCat == "ALL"
      ) {
        sphere.userData.info.filterColor = tempRandomColor;
        sphere.material.color.setHex(tempRandomColor);
      }
      if (
        selectedSubCat != "ALL" &&
        selectedSubCat == sphere.userData.info.categories[selectedCat]
      ) {
        sphere.userData.info.filterColor = tempRandomColor;
        sphere.material.color.setHex(tempRandomColor);
      }
    });
  }
}

function createNodes() {
  nodes = [];

  for (var i = 0; i < jsonReport.nodes.length; i++) {
    var nodeSize = 10; //Math.ceil((Math.random() * 100));
    if (jsonReport.nodes[i].unixtime < -5333097500) nodeSize = 40;

    //This should be optimized.. this info should be processed in the scrapper instead of here.
    var nodeReferencesCount = 0;
    jsonReport.links.forEach(function(li) {
      if (li.source_id == jsonReport.nodes[i].id) {
        nodeReferencesCount++;
      }
    });
    nodeSize = nodeSize + nodeReferencesCount; //(nodeReferencesCount * 0.2);
    var nodeGeometry = new THREE.SphereGeometry(nodeSize, 30, 30);
    var nodeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(DEFAULT_COLOR),
      wireframe: true,
      wireframeLinewidth: 2.0,
      fog: true
    });

    var node = new THREE.Mesh(nodeGeometry, nodeMaterial);

    node.position.x = Math.random() * 2000 - 1000;
    node.position.y = jsonReport.nodes[i].unixtime * 0.00001 * 0.1; //* 0.000001 * 0.2;
    node.position.z = Math.random() * 2000 - 1000;

    node.userData.info = jsonReport.nodes[i];
    node.userData.info.links = [];
    node.userData.info.related = [];
    nodes.push(node);
    scene.add(node);
  }
}

function createEdges() {
  edges = [];
  for (var i = 0; i < jsonReport.links.length; i++) {
    var line_segment = new THREE.Geometry();
    line_segment.vertices.push(
      new THREE.Vector3(
        nodes[jsonReport.links[i].source].position.x,
        nodes[jsonReport.links[i].source].position.y,
        nodes[jsonReport.links[i].source].position.z
      )
    );
    line_segment.vertices.push(
      new THREE.Vector3(
        nodes[jsonReport.links[i].target].position.x,
        nodes[jsonReport.links[i].target].position.y,
        nodes[jsonReport.links[i].target].position.z
      )
    );
    var line = new THREE.Line(
      line_segment,
      new THREE.LineBasicMaterial({
        color: DEFAULT_COLOR, //Math.random() * DEFAULT_COLOR,
        linewidth: 0.8,
        linecap: "round",
        opacity: 0.15,
        transparent: true
      })
    );

    nodes[jsonReport.links[i].source].userData.info.links.push(line); // Saving its links objects
    nodes[jsonReport.links[i].source].userData.info.related.push(
      nodes[jsonReport.links[i].target]
    ); //Saving it's related object Meshes
    edges.push(line);
    scene.add(line);
  }
}
function showNodeToolTip(info) {
  $("#entireWebsiteContainer").data(
    "powertipjq",
    $(
      ["<p><b>" + info.author + "</b></p>", "<p>" + info.date + "</p>"].join(
        "\n"
      )
    )
  );

  $.powerTip.show($("#entireWebsiteContainer"));
}
function showNodeDetails(nodeData) {
  detailsPanel.slideReveal("show");

  detailsPanel.empty();

  var nodeTitle = $("<div></div>").html('"' + nodeData.name + '"');
  nodeTitle.addClass("item_title");

  var nodeAuthor = $("<div></div>");
  nodeData.author.forEach(function(element, index) {
    if (index == 0) {
      nodeAuthor.append(element);
    } else {
      nodeAuthor.append(", " + element);
    }
  });
  nodeAuthor.addClass("item_author");

  var nodeDate = $("<div></div>").html("(" + nodeData.date + ")");
  nodeDate.addClass("item_year");

  // detailsPanel.html(htmlText);
  detailsPanel.append(nodeAuthor);
  detailsPanel.append(nodeDate);
  detailsPanel.append(nodeTitle);

  detailsPanel.append("<br><br>");

  for (var i = 0; i < nodeData.related.length; i++) {
    var htmlText =
      "- " +
      nodeData.related[i].userData.info.author +
      " [" +
      nodeData.related[i].userData.info.date +
      "] " +
      nodeData.related[i].userData.info.name +
      " <br><br>";
    var nodeRelated = $("<div></div>").html(htmlText);
    nodeRelated.addClass("item_connection");
    detailsPanel.append(nodeRelated);
  }
}
// function animate(){

// 	requestAnimationFrame( animate );
// 	render();
// 	update();
// }

function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "output.json", true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function() {
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

  controls.update(delta);
  requestAnimationFrame(render);

  renderer.render(scene, camera);
}

CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear ||
  function(preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
  };
// render();
