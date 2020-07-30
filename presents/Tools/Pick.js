import Tool from './Tool.js'

export default class Pick extends Tool {
  constructor() {
    super();
    this.Name = "Pick";
    this.Description = "Digs a small portion of the wall, stronger in the center";
    this.power = 1;
    this.MaxDurability = -1;
    this.durability = this.MaxDurability;
    this.damage = 8;
  } 
  
  // Return an array of surrounding spots and the damage done to them
  getMinableSpots(x, y) {
    return [[x, y, this.power+1],[x+1, y, this.power],[x-1, y, this.power],[x, y+1, this.power],[x, y-1, this.power]];
  }
 
}
