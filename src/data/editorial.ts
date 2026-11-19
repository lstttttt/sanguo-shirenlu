import manuscript from "./sanguo-editorial.json";
import type { CharacterId } from "./questions";

export const editorialCopy = manuscript.interface;
export const editorialCharacters = manuscript.characters satisfies Record<CharacterId, unknown>;

export function isEditorialCharacter(id: string): id is CharacterId {
  return Object.hasOwn(editorialCharacters, id);
}
