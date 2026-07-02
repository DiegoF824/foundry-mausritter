/**
 * Extend the basic ItemSheetV2 with some very simple modifications
 * @extends {ItemSheetV2}
 */
import { MausritterItemSheetV2 } from "../sheet-v2-helpers.js";

export class MausritterItemSheet extends MausritterItemSheetV2 {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["mausritter", "sheet", "item"],
    initialTab: "description",
    position: {
      width: 520,
      height: 480
    }
  }, { inplace: false });

  /** @override */
  get template() {
    const path = "systems/mausritter/templates/item";
    // Return a single sheet for all item types.
    return `${path}/item-${this.item.type}-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    // return `${path}/${this.item.system.type}-sheet.html`;
  }


  /* -------------------------------------------- */

  /** @override */
  getData(data) {
    return super.getData(data).data;
  }

  // /**
  //  * Organize and classify Items for Character sheets.
  //  *
  //  * @param {Object} itemData The actor to prepare.
  //  *
  //  * @return {undefined}
  //  */
  // _prepareItemData(item) {
  //   console.log(item.system);

  //   if(item.category == "gear"){item.isWeapon = false; item.isCondition = false;}
  //   else if(item.category == "weapon"){
  //     this.object.update({"data.isWeapon" : true});
  //     this.object.update({"data.isCondition" : false});

  //     console.log(item.system.isWeapon);

  //     if(item.weapon.dmg2 != ""){
  //       item.weapon.canSwap = true;
  //     } else {
  //       item.weapon.canSwap = false;
  //     }
  //   }
  //   else if(item.category == "condition"){item.isWeapon = false; item.isCondition = true;}

  //   var dupeItem = foundry.utils.duplicate(item.system);

    
  //   // this.update({"data.recharge.charged": false});
  // }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = $(this.element).find(".sheet-body");
    const bodyHeight = this.position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // if(data.data.pips == null){
    //   data.data.pips = {};
    // }

    // let pipHtml = "";
    // for(let i=0; i < data.data.pips.max; i++){
    //   pipHtml += '<i class="far fa-circle"></i>';
    // }

    // data.data.pips.html= pipHtml;

    // let oldData = foundry.utils.duplicate(this.object.data);
    // this.object.update(oldData);
    // Roll handlers, click handlers, etc. would go here.
  }
}
