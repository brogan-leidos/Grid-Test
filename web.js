import GameGrid from './engine/GameGrid.js'
import {generateGrid} from './engine/Generate-Grid.js'
import GameGridSettings from './engine/GameGridSettings.js'
import Generic from './biome/Generic.js'
import Tool from './presents/Tools/Tool.js'
import Pick from './presents/Tools/Pick.js'


var gameGrid = new GameGrid();
var selectedTool = new Tool();
var availableTools = [];
var highlightedSpots = [];

export default () => {
    firstLaunch();

    document.getElementById('generateButton').addEventListener('click', () => {
        gameGrid = createGameGrid();
        refreshGrid();
    });
    
};

function firstLaunch() {
    availableTools.push(new Pick());
    selectedTool = availableTools[0];
    refreshToolArea();
    refreshHealthBar(); 
}

function createGameGrid() {
    var width = document.getElementById("width").value;
    var height = document.getElementById("height").value;
    var rarity = document.getElementById("rarity").value;
    
    gameGrid.settings = new GameGridSettings(width, height, rarity, new Generic());
    gameGrid = generateGrid(gameGrid);
    
    return gameGrid;
}

function refreshGrid() {
    var gameSection = document.getElementById("gameSection");
    gameSection.innerHTML = "";
    
    // Display upper grid and then lower grid
    // Generate a table based on the given grids
    
    var htmlResult = "";
    
    htmlResult += "<table><tbody>";    
    for (var i=0; i < gameGrid.upperGrid.length; i++) {
        htmlResult += "<tr>";
        for (var j=0; j < gameGrid.upperGrid[i].length; j++) {
            if (gameGrid.upperGrid[i][j] <= 0) {
                var bgColor = gameGrid.lowerGrid[i][j] == "0" ? "#363940" : gameGrid.lowerGrid[i][j].Color;
                htmlResult += `<td id="${i},${j}" class="exposed" style="background-color:${bgColor}"></td>`
            }
            else {
                htmlResult += `<td id="${i},${j}" class="dirt">${gameGrid.upperGrid[i][j].toString()}</td>`
            }
        }
        htmlResult += "</tr>";
    }    
    htmlResult += "</tbody></table>";
    
    gameSection.innerHTML = "";
    gameSection.insertAdjacentHTML('beforeend', htmlResult);
    
    var dirtList = document.getElementsByClassName("dirt");
    for (var i=0; i < dirtList.length; i++){
        dirtList[i].addEventListener('click', (e) => {
            mineClickedSpot(e.target.id);
        });
    }
    
    var exposedList = document.getElementsByClassName("exposed");
    for (var i=0; i < exposedList.length; i++){
        exposedList[i].addEventListener('mouseenter', (e) => {
            highlightValidSpaces(e.target.id);
            updateInfoSection(e.target.id);
        });
    }
    
    return htmlResult;
}

function highlightValidSpaces(spotId) {
    spotId = spotId.split(",");
    var x = parseInt(spotId[0]);
    var y = parseInt(spotId[1]);
    
    highlightedSpots = selectedTool.getMinableSpots(x,y);
    
}

function updateInfoSection(spotId) {
    spotId = spotId.split(",");
    var x = parseInt(spotId[0]);
    var y = parseInt(spotId[1]);   
    var infoSection = document.getElementsByClassName("infoSection")[0];
    
    var object = gameGrid.lowerGrid[x][y];
    if (object != "0") {
        infoSection.innerHTML = object.Name;
    }
    else {
        infoSection.innerHTML = "Empty";
    }
}

function mineClickedSpot(spotId) {
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
    refreshHealthBar();

    selectedTool.durability--;

    if (selectedTool.durability == 0){
        //Oh no it broke!
    }

    refreshGrid();
}

// This is called after a change to the tools array is made, either with the addition or deletion of a tool
function refreshToolArea() {
    var area = document.getElementById("toolArea");
    var newHTML = ""
    for (var i=0; i < availableTools.length; i++) {
        newHTML += `<button id="selectTool-${i}">${availableTools[i].Name}</button>`;   
    }
    
    area.innerHTML = newHTML;
    for (var i=0; i < availableTools.length; i++) {
        var elementName = `selectTool-${i}`;
        document.getElementById(elementName).addEventListener('click', (e) => {
            var eventId = parseInt(e.target.id.split("-")[1]);
            selectedTool = availableTools[eventId];            
        });    
    }    
}

function refreshHealthBar() {
    var bar = document.getElementsByClassName("healthBar")[0];
    var percentRemaining = gameGrid.healthRemaining / gameGrid.maxHealth * 100;
    bar.style.width = `${percentRemaining}%`;
    bar.innerHTML = `${percentRemaining}%`;
    
    if (percentRemaining >= 60) { bar.style.backgroundColor = "green"; }
    if (percentRemaining < 60 && percentRemaining > 30) { bar.style.backgroundColor = "yellow"; }
    if (percentRemaining <= 30) { bar.style.backgroundColor = "red"; }        
}
