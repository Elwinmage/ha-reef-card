export interface Supplement {
  uid: string;
  name: string;
  display_name: string | null;
  short_name: string;
  brand_name: string;
  type: string | null;
  concentration: number | null;
  made_by_redsea: boolean;
  fullname: string;
  sizes?: number[];
  bundle?: any;
  // Visuals served by the redsea integration (supplements catalog)
  image?: string | null;
  thumb?: string | null;
}
