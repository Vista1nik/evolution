
// 3D Visual
var camera, controls, scene, renderer;
let rainGeo, rainCount = 15000;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  $('.render').append(renderer.domElement)

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 400, 200, 0 );

  // controls

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)



  controls.minDistance = 100;
  controls.maxDistance = 300;

  controls.maxPolarAngle = Math.PI / 2;

  // world

  var geometry = new THREE.CylinderBufferGeometry( 0, 20, 60, 4, 1 );
  var material = new THREE.MeshPhongMaterial( { color: 0x6EEB83, flatShading: true } );

  for ( var i = 0; i < 100; i ++ ) {

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add( mesh );

  }

  // lights

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  var light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( - 1, - 1, - 1 );
  scene.add( light );

  var light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );

  window.addEventListener( 'resize', onWindowResize, false );

  // Rain
  rainGeo = new THREE.Geometry();
  for(let i=0;i<rainCount;i++) {
    rainDrop = new THREE.Vector3(
      Math.random() * 400 -200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDrop.velocity = {};
    rainDrop.velocity = 0;
    rainGeo.vertices.push(rainDrop);
  }
  rainMaterial = new THREE.PointsMaterial({
    color: 0xdddddd,
    size: 1,
    transparent: true
  });

  rain = new THREE.Points(rainGeo,rainMaterial);
  scene.add(rain);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  rainGeo.vertices.forEach(p => {
    p.velocity -= 0.1 + Math.random() * 0.1;
    p.y += p.velocity;
    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  rainGeo.verticesNeedUpdate = true;
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  renderer.render( scene, camera );
}

function create3Dorg(org) {
  var geometry = new THREE.BoxGeometry(10 + -org.fur, 20, 10 + -org.fur);
  var material = new THREE.MeshPhongMaterial( { color: 0xFF5714, flatShading: true } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = sys.random(-200, 200);
  mesh.position.y = -20;
  mesh.position.z = sys.random(-200, 200);
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;

  mesh.name = org.id
  scene.add( mesh );
}

function remove3Dorg(id) {
  var selectedObject = scene.getObjectByName(id);
  scene.remove( selectedObject );
}

const sys = {
  random: (min, max) => {
    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
  },
  pause: false,
  speed: 100
}

let liveState = {
  time: 0,
  temp: 0,
  water: 100,
  orgs: []
}

const tick = () => {
  // Update display
  liveState.time = ++liveState.time
  $('#tick').text(liveState.time)

  // Emulate temp change
  liveState.temp = sys.random(liveState.temp - 2, liveState.temp + 2)
  $('#temp').text(liveState.temp)

  // Rain
  liveState.water = liveState.water + 10
  $("#water").text(liveState.water)

  // Calculate result of tick for every organism
  liveState.orgs.forEach(org => {
    organism(org)
  })

  $("#orgs").text = '' // Reset Table
  CreateTableFromJSON(liveState.orgs)
}

// Organism Function calculating behavior depending on state.
const organism = (state) => {


  // Every 10 tick
  if (liveState.time % 10 == 0) {
      // Birth with Evolution
      let newOrg = {
        fur: sys.random(state.fur - 5, state.fur + 5),
        age: 0,
        generation: state.generation + 1,
        waterNeeds: sys.random(1, state.waterNeeds + 2),
        id: sys.random(0, 10000),
        ticksWithoutWater: 0
      }

      liveState.orgs.push(newOrg)
      create3Dorg(newOrg)
  }

  // Consume water
  if (liveState.water - state.waterNeeds <= 0 == false) {
    liveState.water = liveState.water - state.waterNeeds
  } else {
    liveState.orgs[_.findIndex(liveState.orgs, {id: state.id })].ticksWithoutWater = state.ticksWithoutWater + 1
  }

  // Increase age
  liveState.orgs[_.findIndex(liveState.orgs, {id: state.id })].age = state.age + 1

  if (state.fur - 10 > liveState.temp || state.fur + 10 < liveState.temp || state.ticksWithoutWater == 10 || state.age == 40) {
    // Death
    _.pull(liveState.orgs, state)
    remove3Dorg(state.id)
  }
}

// Create First Generation Organism
let firstOrg = {
  fur: 2,
  generation: 0,
  id: sys.random(0, 10000),
  waterNeeds: 2,
  ticksWithoutWater: 0,
  age: 0
}

liveState.orgs.push(firstOrg)
create3Dorg(firstOrg)

document.onkeypress = function (e) {
  if (e.key == 'Enter') {
    let newOrg = {
      fur: liveState.temp,
      generation: 0,
      id: sys.random(0, 10000),
      waterNeeds: 2,
      ticksWithoutWater: 0,
      age: 0
    }

    liveState.orgs.push(newOrg)
    create3Dorg(newOrg)
  }
};


// Tick Mechanism
let time = setInterval(() => tick(), sys.speed);


// Temp JQuery Visual
function CreateTableFromJSON(myBooks) {

  // EXTRACT VALUE FOR HTML HEADER.
  // ('Book ID', 'Book Name', 'Category' and 'Price')
  var col = [];
  for (var i = 0; i < myBooks.length; i++) {
      for (var key in myBooks[i]) {
          if (col.indexOf(key) === -1) {
              col.push(key);
          }
      }
  }

  // CREATE DYNAMIC TABLE.
  var table = document.createElement("table");

  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

  var tr = table.insertRow(-1);                   // TABLE ROW.

  for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = col[i];
      tr.appendChild(th);
  }

  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (var i = 0; i < myBooks.length; i++) {

      tr = table.insertRow(-1);

      for (var j = 0; j < col.length; j++) {
          var tabCell = tr.insertCell(-1);
          tabCell.innerHTML = myBooks[i][col[j]];
      }
  }

  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
  var divContainer = document.getElementById("orgs");
  divContainer.innerHTML = "";
  divContainer.appendChild(table);
}