import { MenuItem } from "./menu-item.model";

export class Section {
  id?: string;
  uid: string;
  name: string;
  order: number;
  description?: string;
  menuItems?: MenuItem[];
}
