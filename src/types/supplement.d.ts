export interface Supplement {
  uid: string;
  name: string;
  display_name: string;
  short_name: string;
  brand_name: string;
  type: string|null;
  concentration: number|null;
  made_by_redsea: boolean;
  fullname: string;
  sizes?: number[];
  bundle?: any;
}
