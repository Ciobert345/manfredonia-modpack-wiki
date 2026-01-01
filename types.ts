
export interface Mod {
  name: string;
  category: ModCategory;
  description: string;
  wiki: string;
  color?: string;
  slug?: string; // Slug primario (solitamente Modrinth)
  curseSlug?: string; // Slug alternativo per CurseForge
  isLibrary?: boolean;
}

export type ModCategory = 
  | 'all'
  | 'optimization'
  | 'dimensions'
  | 'structures'
  | 'combat'
  | 'rpg'
  | 'utility'
  | 'storage'
  | 'biomes'
  | 'decoration'
  | 'visual'
  | 'farming'
  | 'tech'
  | 'multiplayer'
  | 'library'
  | 'misc';

export interface CategoryInfo {
  id: ModCategory;
  label: string;
  icon: string;
  color: string;
}
