const sys = {
  random: (min, max) => {
    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
  }
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
      liveState.orgs.push({
        fur: sys.random(state.fur - 5, state.fur + 5),
        age: 0,
        generation: state.generation + 1,
        waterNeeds: sys.random(1, state.waterNeeds + 2),
        id: sys.random(0, 10000),
        ticksWithoutWater: 0
      })
  }

  // Consume water
  if (liveState.water - state.waterNeeds <= 0 == false) {
    liveState.water = liveState.water - state.waterNeeds
  } else {
    liveState.orgs[_.findIndex(liveState.orgs, {id: state.id })].ticksWithoutWater = state.ticksWithoutWater + 1
  }

  // Increase age
  liveState.orgs[_.findIndex(liveState.orgs, {id: state.id })].age = state.age + 1

  if (state.fur + 10 < liveState.temp || state.fur - 10 > liveState.temp || state.ticksWithoutWater == 10 || state.age == 40) {
    // Death
    _.pull(liveState.orgs, state)
  }
}

// Create First Generation Organism
liveState.orgs.push({
    fur: 2,
    generation: 0,
    id: sys.random(0, 10000),
    waterNeeds: 2,
    ticksWithoutWater: 0,
    age: 0
})

// Tick Mechanism
const time = setInterval(() => tick(), 100);


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