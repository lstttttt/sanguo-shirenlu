import raw from "./characters.json";
import type { CharacterId } from "./questions";

export type Character = typeof raw[number] & { id: CharacterId };
export const characters = raw as Character[];
export const characterMap = Object.fromEntries(characters.map(item => [item.id, item])) as Record<CharacterId, Character>;
