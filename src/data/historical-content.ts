import raw from "./historical-content.json";
import type { CharacterId } from "./questions";

export type SourceType="primary_history"|"annotated_history"|"later_history"|"literary"|"modern_lecture"|"product_copy";
export interface HistoricalSource{type:SourceType;label:string;author?:string;title:string;chapterOrEpisode?:string;quote?:string;paraphrase:string;interpretation:string;url?:string;verified:boolean}
export interface CharacterHistoricalContent{
  heroLine:string;tensionLine:string;originalSealLine:string;
  userMirror:{decisionStyle:string;peopleStyle:string;strength:string;cost:string};
  timeline:Array<{date:string;title:string;event:string;traitMeaning:string;sources:HistoricalSource[]}>;
  evaluations:HistoricalSource[];poetry:HistoricalSource[];
  historyVsFiction:{history:string;fiction:string;assessmentUses:string};
  achievementCostPairs:Array<{strength:string;cost:string}>;
}

export const historicalContent=raw as Partial<Record<CharacterId,CharacterHistoricalContent>>;
