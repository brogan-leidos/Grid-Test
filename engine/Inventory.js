export default class Inventory {
  constructor() {
    this.inventory = new Map(); // Style: ObjectName: Array<Object>
    this.money = 0;
    this.availableTools = [];
    this.availableItems = [];
    this.availableBiomes = [];
  }
  
  addToInventory(object) {
    if (this.inventory.has(object.Name) == false) {
      this.inventory.set(object.Name, new Array());      
    }
    this.inventory.get(object.Name).push(object);
  }
  
  removeFromInventory(objectName) {
    if (this.inventory.has(objectName) == false){
      // Something very wrong has happened
    }
    var retItem = this.inventory.get(objectName).pop();
    if (this.inventory.get(objectName).length == 0) {
      this.inventory.delete(objectName);
    }
    return retItem;
  }
}
