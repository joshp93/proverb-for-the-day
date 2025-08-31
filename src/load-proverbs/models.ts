export interface Proverb {
  ref: string;
  proverb: string;
}

export interface LoadProverbsEvent {
  proverbs: Proverb[];
  version: string;
}
