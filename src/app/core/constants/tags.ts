import { Tag } from "src/app/_models/tag.model";

export const HARDCODED_TAGS: Tag[] = [
  new Tag('R/U', 'Raw/Undercooked', '#ADD8E6'),  // Blue
  new Tag('GF', 'Gluten Free', '#FFA07A'),       // Light Orange
  new Tag('Alc', 'Contains Alcohol', '#000000'), // Black
  new Tag('D', 'Contains Dairy', '#FF0000'),     // Red
  new Tag('Vgn', 'Vegan', '#90EE90'),            // Light Green
  new Tag('Veg', 'Vegetarian', '#006400'),       // Dark Green
  new Tag('Nuts', 'Contains Nuts', '#A52A2A')    // Brown
];
