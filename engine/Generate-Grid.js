/* SETTINGS OBJECT:
    Has: Rarity, temp, width, height, biome

*/


// Generates 2 layers of the grid
// Layer 1: the underlying loot layer, this is where the objects go
// Layer 2: The overlaying dirt layer. This determines how hard it is to dig down
export function generateGrid(gameGrid) {
  var settings = gameGrid.settings;
  // Determine how many items to spawn (Determined by the richness of the vein)
  var density = calculateDensity(settings);
  
  // Determine what kinds of objects to spawn (also determined by rarity)
  var objectList = assignTypesToDensity(settings, density);
  gameGrid.objects = objectList;
  
  // Spawn those bad boys
  gameGrid.lowerGrid = placeObjects(settings, objectList);
  
  // Generate a dirt layer to cover everything
  gameGrid.upperGrid = generateUpperGrid(settings);   
  
  return gameGrid;
}

function initializeGrid(width, height, value="0") {
  var grid = [];
  for (var x = 0; x < width; x++) {
    grid[x] = new Array();
    for (var y = 0; y < height; y++) {
       grid[x][y] = value;
    }
  }
  
  return grid;
}

function growPlotAtSpot(grid, x, y) {
    if (x > grid.length || y > grid[0].length || x < 0 || y < 0) { 
        return false;
    }
    
    var odds = 0;
    // check adjacent spots for plot
    if (grid[x+1][y]  > 1) { odds++ }
    if (grid[x-1][y]  > 1) { odds++ }
    if (grid[x][y+1]  > 1) { odds++ }
    if (grid[x][y-1]  > 1) { odds++ }
    // if its adjacent increase the odds
    var roll = Math.floor(Math.random() * 10 + 1) + odds;    
    if (roll > 6) {
        return true;
    }    
    return false;    
}

function placePlot(grid, x, y, itteration) {
    grid[x][y] += 1;
    if (itteration >= 10) {
        return grid;
    }
    
    if (growPlotAtSpot(grid, x+1, y)){
        grid = placePlot(grid, x+1, y, itteration+1);  
    }
    if (growPlotAtSpot(grid, x-1, y)){
        grid = placePlot(grid, x-1, y, itteration+1);  
    }
    if (growPlotAtSpot(grid, x, y+1)){
        grid = placePlot(grid, x, y+1, itteration+1);  
    }
    if (growPlotAtSpot(grid, x, y-1)){
        grid = placePlot(grid, x, y-1, itteration+1);
    }
    return grid;
}

function generateUpperGrid(settings) {
   var grid = initializeGrid(settings.width, settings.height, 1);
   var numPlots = settings.width * settings.height / 10;
   
   for (var i=0; i < numPlots; i++){
       var x = Math.floor(Math.random() * grid.length);
       var y = Math.floor(Math.random() * grid[0].length);
       grid = placePlot(grid, x, y, 0);   
   }
    
   return grid;
}

// Rarity should be a number between 0 (there is nothing) to 1 (Doesnt get better than this)
function calculateDensity(settings) {
  //Math.floor(Math.random() * 10 + 1) will give us an int between 1 and 10
  var numLarge = 0;
  var numMed = 0;
  var numSmall = 0;
  
  
  // Calculate total number of objects
  var minItems = settings.rarity * 10;   
  var maxItems = settings.height * settings.width / 10;
  var remainingItems = Math.floor(Math.random() * (maxItems-minItems) + minItems);
  
  // Determine the size of each item. Could be large (10%), med (35%), or small (the rest)
  for (var i=0; i < remainingItems; i++) {
    var roll = Math.floor(Math.random() * 100 + 1);
    if (roll <= 10) {
      numLarge++;
    }
    else if (roll <= 45) {
      numMed++;
    }
    else {
      numSmall++;
    }
  }
  
  
  return [numLarge, numMed, numSmall];
}

function spawnObjectFromList(spawnList) {
    while(true) {
        for (var i=0; i < spawnList.length; i++) {
            if (Math.random() <= spawnList[i].rarity){
                return spawnList[i];
            }
        }
    }
}

// Density is [Large, Med, Small]
function assignTypesToDensity(settings, density) {
    // Fetch biome list at some later date
    var objectList = [];
    
    var spawnList = settings.biome.getLargeObjects();
    for (var i=0; i < density[0]; i++) {      
        objectList.push(spawnObjectFromList(spawnList));
    }

    var spawnList = settings.biome.getMediumObjects();
    for (var i=0; i < density[1]; i++) {      
        objectList.push(spawnObjectFromList(spawnList));
    }

    var spawnList = settings.biome.getSmallObjects();
    for (var i=0; i < density[2]; i++) {      
        objectList.push(spawnObjectFromList(spawnList));
    }
    
    return objectList;
}

function checkSpotValidity(grid, xOrigin, yOrigin, object) {
    // TODO: Allow for rotation, and revamp w/h system to allow for more interesting shapes
    if (xOrigin + object.width >= grid.length) {
        return false;
    }
    else if (yOrigin + object.height >= grid[0].length) {
        return false;
    }
    
    for (var xScan=0; xScan < object.width; xScan++) {
        for (var yScan=0; yScan < object.height; yScan++){
            if (grid[xOrigin + xScan][yOrigin + yScan] != 0) {
                return false;
            }
        }
    }    
    return true;
}

function placeObject(grid, xOrigin, yOrigin, object) {
    for (var x=0; x < object.width; x++) {
        for (var y=0; y < object.height; y++) {
            grid[xOrigin + x][yOrigin + y] = object;   
        }
    }
    return grid;
}

function placeObjects(settings, objectList) {
    var grid = initializeGrid(settings.width, settings.height);
    for (var i=0; i < objectList.length; i++){
        var continueLoop = true;
        while (continueLoop) {
            // Pick a random spot to slap this thing down
            var x = Math.floor(Math.random() * settings.width + 1);
            var y = Math.floor(Math.random() * settings.height + 1);        
            if(checkSpotValidity(grid, x, y, objectList[i])) {
                grid = placeObject(grid, x, y, objectList[i]);
                continueLoop = false;
            }
        }        
    }
    return grid;
}
