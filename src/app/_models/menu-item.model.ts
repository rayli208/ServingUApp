import { Tag } from "./tag.model";

export class MenuItem {
    id?: string;
    uid: string;
    sectionId: string;
    order: number;
    name: string;
    description?: string; 
    price: number;
    fileName?: string;
    imageUrl?: string;
    tags?: Tag[]; 
  }