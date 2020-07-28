import GameGrid from './engine/GameGrid.js'
import {generateGrid} from './engine/Generate-Grid.js'
import GameGridSettings from './engine/GameGridSettings.js'
import Inventory from './engine/Inventory.js'
import { Tool, Pick, Hammer, Drill, Vaporizer } from './presents/Tools/index.js' 
import Support from './presents/items/Support.js'
import BiomeManager from './biome/BiomeManager.js'


var gameGrid = new GameGrid();
var selectedTool = new Tool();
var inventory = new Inventory();
var biomeManager = new BiomeManager();

var highlightedSpots = [];

export default () => {
    firstLaunch();

    document.getElementById('generateButton').addEventListener('click', () => {
        gameGrid = createGameGrid();
        refreshGrid();
        refreshBiomeTab();

    });
    
    document.getElementById('showInventoryButton').addEventListener('click', () => {
        showInventory();
    });
    
};

function firstLaunch() {
    inventory.availableTools.push(new Pick(), new Hammer(), new Drill(), new Vaporizer());
    inventory.availableItems.push(new Support());
    selectedTool = inventory.availableTools[0];
    
    inventory.availableBiomes = ["Generic", "Forest", "Ocean"];
    
    refreshToolArea();
    refreshItemArea();
    refreshHealthBar(); 
}

function createGameGrid() {
    var width = document.getElementById("width").value;
    var height = document.getElementById("height").value;
    var rarity = document.getElementById("rarity").value;
    
    gameGrid.settings = new GameGridSettings(width, height, rarity, biomeManager.selectedBiome);
    gameGrid = generateGrid(gameGrid);

    refreshHealthBar();
    refreshDebugArea();
    
    return gameGrid;
}

function refreshGrid() {    
    drawGridWithOverlay(); 
    assignEventsToGrid();
    highlightRevealvedObjects();
    refreshHealthBar();
}

// Replaces gameSection with new HTML representing current gameGrid
function drawGridWithOverlay() {
    var htmlResult = "";
    
    htmlResult += "<table><tbody>";    
    for (var i=0; i < gameGrid.upperGrid.length; i++) {
        htmlResult += "<tr>";
        for (var j=0; j < gameGrid.upperGrid[i].length; j++) {
            if (gameGrid.upperGrid[i][j] <= 0) { // in areas without dirt covereing them //#363940 -- old bg color
                var styles = ""
                var bgColor = "";
                var image = "";
                if (gameGrid.lowerGrid[i][j] != "0") {
                    bgColor = gameGrid.lowerGrid[i][j].Color;
                    image = gameGrid.lowerGrid[i][j].ImagePath;                    
                }
                styles += `background-color:${bgColor};`;
                if (image != "") {
                    styles += `background:url(${image}); background-repeat:no-repeat; background-size:contain;`
                }
                styles += `border: 1px solid ${biomeManager.selectedBiome.GridBorderColor};`;

                htmlResult += `<td id="${i},${j}" class="exposed" style="${styles}"></td>`
            }
            else {
//                 var bgcolor = getColorFromDirtValue(gameGrid.upperGrid[i][j]);
                var bgcolor = tintBgColor(biomeManager.selectedBiome.GridBackgroundColor, gameGrid.upperGrid[i][j]);                
                var border = biomeManager.selectedBiome.GridBorderColor;
                htmlResult += `<td id="${i},${j}" class="dirt" style="background-color:${bgcolor};border:2px solid ${border}">
                                   ${gameGrid.upperGrid[i][j].toString()}
                               </td>`;
            }
        }
        htmlResult += "</tr>";
    }    
    htmlResult += "</tbody></table>";
    
    var gameSection = document.getElementById("gameSection");  
    
    gameSection.innerHTML = "";
    gameSection.insertAdjacentHTML('beforeend', htmlResult);
}

function tintBgColor(bgColor, gridValue) {
    if (bgColor.length == 4) {
        bgColor = `#${bgColor[1]}${bgColor[1]}${bgColor[2]}${bgColor[2]}${bgColor[3]}${bgColor[3]}`;
    }
    var red = parseInt("0x" + bgColor.substr(1,2));
    var green = parseInt("0x" + bgColor.substr(3,2));
    var blue =  parseInt("0x" + bgColor.substr(5,2));
    
    var gridColorTint = gridValue * 25;
    
    red -= gridColorTint;
    green -= gridColorTint;
    blue -= gridColorTint;
    
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}

function getColorFromDirtValue(value) {
    switch (value) {
        case 0: 
            return "white"
        case 1:
            return "#e6ceac";
        case 2:
            return "#9c9386";
        case 3:
            return "#6e6c69";        
    }    
}

function assignEventsToGrid() {
    var dirtList = document.getElementsByClassName("dirt");
    for (var i=0; i < dirtList.length; i++){
        dirtList[i].addEventListener('click', (e) => {
            mineClickedSpot(e.target.id);
        });
        dirtList[i].addEventListener('mouseenter', (e) => {
            highlightValidSpaces(e.target.id);;
        });
    }
    
    var exposedList = document.getElementsByClassName("exposed");
    for (var i=0; i < exposedList.length; i++){
        exposedList[i].addEventListener('mouseenter', (e) => {
            updateInfoSection(e.target.id);
        });
    }
}

// Highlights spaces that the current tool can mine
function highlightValidSpaces(spotId) {
    spotId = spotId.split(",");
    var x = parseInt(spotId[0]);
    var y = parseInt(spotId[1]);
    
    var highlightMemory = [];    
    
    if (highlightedSpots.length != 0) {
        highlightMemory = highlightedSpots;
    }

    var potentialSpots = selectedTool.getMinableSpots(x,y);    
    highlightedSpots = potentialSpots.filter(a => a[0] < gameGrid.settings.width && a[0] >= 0 && a[1] < gameGrid.settings.height && a[1] >= 0);
    
    for (var i=0; i < highlightMemory.length; i++) {
        var spotToDim = document.getElementById(`${highlightMemory[i][0]},${highlightMemory[i][1]}`);
        spotToDim.style.borderColor = biomeManager.selectedBiome.GridBorderColor;
    }
    
    for (var i=0; i < highlightedSpots.length; i++) {     
        var spotToLight = document.getElementById(`${highlightedSpots[i][0]},${highlightedSpots[i][1]}`);
        spotToLight.style.borderColor = 'red';
    }

    highlightRevealvedObjects();
}

// Adds a green border to objects that are fully revealed
function highlightRevealvedObjects() {
    for (var i=0; i < gameGrid.objects.length; i++) {
        var object = gameGrid.objects[i];  
        if (object.FullyRevealed) {
            var spots = object.getOccupiedSpots();
            for (var j=0; j < spots.length; j++) {
                document.getElementById(`${spots[j][0]},${spots[j][1]}`).style.borderColor = "#36c95e";
            }
        }
    }
}

// Updates info bar to give info on what the mouse is over
function updateInfoSection(spotId) {
    spotId = spotId.split(",");
    var x = parseInt(spotId[0]);
    var y = parseInt(spotId[1]);   
    var infoSection = document.getElementsByClassName("infoSection")[0];
    
    var object = gameGrid.lowerGrid[x][y];
    if (object != "0") {
        infoSection.innerHTML = object.Name + ": " + object.description;
    }
    else {
        infoSection.innerHTML = "Empty";
    }
}

function displayInInfoSection(message) {
    var infoSection = document.getElementsByClassName("infoSection")[0];
    infoSection.innerHTML = message;
}

// Destroy the appropriate dirt layer, lower tool durability, damage the wall, and reveal objects as necessary
function mineClickedSpot(spotId) {
    if(!checkIfStillStanding()) {
        return;
    }
    
    spotId = spotId.split(",");
    var x = parseInt(spotId[0]);
    var y = parseInt(spotId[1]);
    
    var minableSpots = selectedTool.getMinableSpots(x,y);
    for (var i=0; i < minableSpots.length; i++) {
        var mineX = minableSpots[i][0];
        var mineY = minableSpots[i][1];
        var power = minableSpots[i][2];
        
        if (mineX >= gameGrid.settings.width || mineX < 0 || mineY >= gameGrid.settings.height || mineY < 0) {
            continue;
        }        
        gameGrid.upperGrid[mineX][mineY] -= power;
    }
    
    gameGrid.healthRemaining -= selectedTool.damage;
    selectedTool.durability--;
    refreshDurabilityArea();

    if (selectedTool.durability == 0){
        breakCurrentTool();
    }

    for (var i=0; i < gameGrid.objects.length; i++) {
        if (checkIfObjectIsRevealed(gameGrid.objects[i])) {
            gameGrid.objects[i].FullyRevealed = true;
        }            
    }
    
    refreshGrid();
}

function checkIfStillStanding() {
    return gameGrid.healthRemaining > 0;   
}

function breakCurrentTool() {
    var area = document.getElementById("toolDurability");
    area.innerHTML = "Oh no, your " + selectedTool.Name + " broke!"
    
    inventory.availableTools = inventory.availableTools.filter(a => a.Name != selectedTool.Name);
    selectedTool = inventory.availableTools[0];
    refreshToolArea();
}

function refreshDurabilityArea() {    
    var area = document.getElementById("toolDurability");
    area.innerHTML = "";
    if (selectedTool.durability < 0) {
        return;
    }
    area.innerHTML = selectedTool.durability + " durability";   
}

// This is called after a change to the tools array is made, either with the addition or deletion of a tool
function refreshToolArea() {
    var area = document.getElementById("toolArea");
    var newHTML = ""
    for (var i=0; i < inventory.availableTools.length; i++) {
        newHTML += `<button id="selectTool-${i}">${inventory.availableTools[i].Name}</button>`;   
    }
    
    area.innerHTML = newHTML;
    for (var i=0; i < inventory.availableTools.length; i++) {
        var elementName = `selectTool-${i}`;
        document.getElementById(elementName).addEventListener('click', (e) => {
            var eventId = parseInt(e.target.id.split("-")[1]);
            selectedTool = inventory.availableTools[eventId];
            refreshDurabilityArea();
        });    
    }    
}

// This is called after the addition or use of an item
function refreshItemArea() {
    var area = document.getElementById("itemArea");
    var newHTML = ""
    for (var i=0; i < inventory.availableItems.length; i++) {
        newHTML += `<button id="selectItem-${i}">${inventory.availableItems[i].Name}</button>`;   
    }
    
    area.innerHTML = newHTML;
    for (var i=0; i < inventory.availableItems.length; i++) {
        assignEventsToItem(`selectItem-${i}`);        
    }    
}

function assignEventsToItem(elementName) {
    document.getElementById(elementName).addEventListener('click', (e) => {
        var eventId = parseInt(e.target.id.split("-")[1]);
        inventory.availableItems[eventId].behavior(gameGrid);
        inventory.availableItems[eventId].NumberRemaining--;
        if (inventory.availableItems[eventId].NumberRemaining == 0) {
            inventory.availableItems = inventory.availableItems.filter(a => a.NumberRemaining > 0);
            refreshItemArea();                
        }
        refreshGrid();
    });

    document.getElementById(elementName).addEventListener('mouseover', (e) => {
        var eventId = parseInt(e.target.id.split("-")[1]);
        displayInInfoSection(`${inventory.availableItems[eventId].Description}`);
    });
}

function refreshHealthBar() {
    var bar = document.getElementsByClassName("healthBar")[0];
    var percentRemaining = Math.floor(gameGrid.healthRemaining / gameGrid.maxHealth * 100);
    bar.style.width = `${percentRemaining}%`;
    bar.innerHTML = `${percentRemaining}%`;
    
    var red = 0;
    var green = 200;
    
    //each 1% is 5.1 to red
    red += Math.min((100 - percentRemaining) * 5.1, 255);
    if (percentRemaining <= 50) {
        green -= Math.max((50 - percentRemaining) * 4, 0);
    }
    
    bar.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
    
    if (gameGrid.healthRemaining <= 0) {
        bar.style.width = "0%";
        harvestWall();        
    }
}

// NOTE: Likely temporary as we debug
function refreshBiomeTab() {
    var biomeSelect = document.getElementById("biomeSelect");
    var htmlAppend = "";

    for (var i=0; i < inventory.availableBiomes.length; i++) {
        var biome = inventory.availableBiomes[i];
        if (biome != biomeManager.selectedBiome.Name) {
            htmlAppend += `<button id="Biome-${biome}">${biome}</button>`;        
        }
    }
    biomeSelect.innerHTML = htmlAppend;
    
    for (var i=0; i < inventory.availableBiomes.length; i++) {
        if (inventory.availableBiomes[i] != biomeManager.selectedBiome.Name) {
            document.getElementById(`Biome-${inventory.availableBiomes[i]}`).addEventListener('click', (e) => {
                // TODO put all this in its own function            
                var biomeName = e.target.id.split("-")[1];
                var newBiome = biomeManager.Biomes.filter(a => a.Name == biomeName)[0];
                biomeManager.selectedBiome = newBiome;
                document.getElementById("gameSection").style.background = `url(${newBiome.ImagePath})`;
                document.getElementById("gameSection").style.backgroundRepeat = `no-repeat`;
                document.getElementById("gameSection").style.backgroundSize = `contain`;
                refreshBiomeTab();
            });
        }
    }
    
    
}

// collect the LOOT
function harvestWall() {
    // go through object list, check what has been fully uncovered and collect it
    var htmlAppend = ""
    for (var i=0; i < gameGrid.objects.length; i++) {
        if (checkIfObjectIsRevealed(gameGrid.objects[i])) {
            htmlAppend += "Fully uncovered:" + gameGrid.objects[i].Name + "!<br>";
            var asdf = inventory.inventory[gameGrid.objects[i].Name];
            if (inventory.inventory[gameGrid.objects[i].Name] !== undefined) {
                inventory.inventory[gameGrid.objects[i].Name]++;
            }
            else {
                inventory.inventory[gameGrid.objects[i].Name] = 1;
            }
        }        
    }
    document.getElementById("debugArea").innerHTML = htmlAppend;
}

function checkIfObjectIsRevealed(object) {
    var occupiedSpots = object.getOccupiedSpots();
    var fullyUncovered = true;
    for (var spot=0; spot < occupiedSpots.length; spot++) {
        if (parseInt(gameGrid.upperGrid[occupiedSpots[spot][0]][occupiedSpots[spot][1]]) > 0) {
            fullyUncovered = false;
        }
    }
    return fullyUncovered;
}

function showInventory() {
    var area = document.getElementById("debugArea");
    var htmlAppend = "";
    var keys = Object.keys(inventory.inventory);
    for(var i=0; i < keys.length; i++) {
        htmlAppend += inventory.inventory[keys[i]] + "x " + keys[i] + "<br>";
    }
    area.innerHTML = htmlAppend;
}

function refreshDebugArea() {
    var area = document.getElementById("debugArea");
    var htmlAppend = "";
    for(var i=0; i < gameGrid.objects.length; i++) {
        htmlAppend += gameGrid.objects[i].Name + " | " + gameGrid.objects[i].origin + "<br>";
    }
    area.innerHTML = htmlAppend;
}
