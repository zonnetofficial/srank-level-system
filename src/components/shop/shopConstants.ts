export const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground border-muted-foreground/30',
  uncommon: 'text-stat-agi border-stat-agi/30',
  rare: 'text-primary border-primary/30',
  epic: 'text-stat-vit border-stat-vit/30',
  legendary: 'text-accent border-accent/30',
};

export const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'shadow-[0_0_8px_hsl(150_85%_52%/0.2)]',
  rare: 'shadow-[0_0_10px_hsl(195_100%_55%/0.25)]',
  epic: 'shadow-[0_0_12px_hsl(340_85%_62%/0.3)]',
  legendary: 'shadow-[0_0_15px_hsl(45_100%_60%/0.35)]',
};

export const RARITY_LABELS: Record<string, string> = {
  common: 'Común',
  uncommon: 'Poco Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

export const CATEGORY_LABELS: Record<string, string> = {
  vanity: 'Vanidad',
  booster: 'Mejora',
  consumable: 'Consumible',
  special: 'Especial',
};
