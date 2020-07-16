import Mob from './Mob.js'
import Weapon from './Weapon.js'
import DamageRoll from './DamageRoll.js'

export default class ObjectLarge extends Mob {
  constructor() {
    super();
    this.Name = "ObjectLarge";
    this.Icon = "\"robot\""
    
    this.Str = 2;
    this.Dex = 0;
    this.Con = 0;
    this.Int = -4;
    this.Wis = -4;
    this.Chr = -5;
    
    this.DamageRoll = new DamageRoll();
    
    this.Weapons = [
      new Weapon("Slam", 2, 10, "bludgeoning", 6, 2)
    ];
    
    this.EquipWeapon = this.Weapons[0];
    
  }
  
}
