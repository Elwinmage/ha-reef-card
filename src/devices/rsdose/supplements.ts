import { SUPPLEMENTS } from "./supplements_list";
import { Supplement } from "../../types/supplement";

class Supplements {
  _list: Supplement[];

  constructor() {
    this._list = SUPPLEMENTS;
  } //end of constructor

  get_supplement_from_uid(uid) {
    let supplement = null;
    for (supplement of this._list) {
      if (supplement.uid === uid) {
        return supplement;
      }
      if (supplement.type === "Bundle") {
        for (const supp of Object.keys(supplement.bundle)) {
          const bundle_supplement = supplement.bundle[supp];
          if (bundle_supplement.supplement.uid === uid) {
            bundle_supplement.supplement.sizes = supplement.sizes.map(
              function (x) {
                return x * bundle_supplement.ratio;
              },
            );
            return bundle_supplement.supplement;
          }
        }
      } //if
    } //for
    return null;
  } //end of function get_supplement

  get_supplement_from_fullname(name) {
    let supplement = null;
    for (supplement of this._list) {
      if (supplement.fullname === name) {
        return supplement;
      }
      if (supplement.type === "Bundle") {
        for (const supp of Object.keys(supplement.bundle)) {
          const bundle_supplement = supplement.bundle[supp];
          if (bundle_supplement.supplement.fullname === name) {
            bundle_supplement.supplement.sizes = supplement.sizes.map(
              function (x) {
                return x * bundle_supplement.ratio;
              },
            );
            return bundle_supplement.supplement;
          }
        }
      } //if
    } //for
    return null;
  } //end of function get_supplement
}

const supplements_list = new Supplements();
export default supplements_list;
