import raw from "./historical-content.json";
import type { CharacterId } from "./questions";
import { expandedHistoricalContent } from "./historical-content-expanded";
import { longformEvents, longformVoiceNotes } from "./result-longform";

export type SourceType="primary_history"|"annotated_history"|"later_history"|"literary"|"modern_lecture"|"product_copy";
export interface HistoricalSource{type:SourceType;label:string;author?:string;title:string;chapterOrEpisode?:string;quote?:string;paraphrase:string;interpretation:string;url?:string;verified:boolean}
export interface CharacterHistoricalContent{
  heroLine:string;tensionLine:string;originalSealLine:string;
  introBridge?:string;timelineBridge?:string;
  userMirror:{decisionStyle:string;peopleStyle:string;strength:string;cost:string};
  timeline:Array<{date:string;title:string;event:string;traitMeaning:string;sources:HistoricalSource[]}>;
  evaluations:HistoricalSource[];poetry:HistoricalSource[];
  historyVsFiction:{history:string;fiction:string;assessmentUses:string};
  achievementCostPairs:Array<{strength:string;cost:string}>;
  closingLine?:string;
}

const bridgeCopy:Record<CharacterId,{introBridge:string;timelineBridge:string}>={
  caocao:{introBridge:"当你先动，旁人还在寻找确定性。把反对者也叫进帐中，只要他手里有解决问题的本领；这种气魄能重排败局，也会让秩序慢慢变成个人的影子。",timelineBridge:"官渡并非一个人忽然想出奇计，而是缺粮、动摇、降人与旧友的劝告同时来到营门前。能听进复杂声音，才有资格在关键处下令。"},
  liubei:{introBridge:"你愿意为旧人留下一条路，也相信失败后仍能把人带回同一条路上。信义能聚成力量，但情义一旦进入战略，也会让止损变得艰难。",timelineBridge:"他多次失去地盘却没有失去同行者；从转徙到夷陵，关系既是支撑，也成为最难撤回的选择。"},
  sunquan:{introBridge:"你不急着赢第一回合，更在意下一回合是否还留在桌上。耐心与授权能换来空间，长期平衡也需要一条不可交易的底线。",timelineBridge:"从年少接掌江东到赤壁拍板、再到晚年继承危机，他的路始终在“留住局面”与“失去秩序”之间摆动。"},
  sunce:{introBridge:"机会窗口一开，你更愿先取得行动权。速度能把可能变成事实，也会把安全、善后与承接留在身后。",timelineBridge:"数年间平定江东、延揽人才、再到骤然遇刺：他的事业既靠锋芒打开，也提醒后来者补上制度与护栏。"},
  zhugeliang:{introBridge:"你看重的不是一次漂亮胜利，而是让正确的事下次还能发生。系统与责任能稳定混乱，也可能让所有重担最终压在一个人身上。",timelineBridge:"从隆中谋划到治蜀、托孤与北伐，诸葛亮留下的是一条把愿景翻译成次序、责任和执行的路。"},
  zhouyu:{introBridge:"你会拆开决定胜负的少数条件，并愿意为判断亲自承担风险。强判断能压住恐慌，也须给不同证据与人的余地。",timelineBridge:"从江东创业到赤壁主战、南郡经营与早逝，他的生平说明正确判断仍要交给时间、身体与执行来完成。"},
  lusu:{introBridge:"你把敌友放进一张长期地图，不把一时口舌当作全部局势。联盟能换来空间，维护联盟的人也常要承受两边的怀疑。",timelineBridge:"榻上策、联刘抗曹与益阳交涉连在一起，鲁肃既能搭桥，也从未忘记桥的两岸各有边界。"},
  guanyu:{introBridge:"你会先问选择是否合乎承诺，再问它是否方便。原则能形成极强信用，尊严若没有转圜，也会让关系失去出口。",timelineBridge:"从报曹公之恩而归刘，到镇守荆州、威震华夏与失守，关羽的一生把威望、原则与联盟风险写在同一张图上。"},
  zhangfei:{introBridge:"越到别人后退的时候，你越可能站到最前。危机中的担当真实可贵，但把危机的强硬带回日常，也会让跟随者只剩恐惧。",timelineBridge:"长坂、江州、宕渠与最后的帐下之祸，让张飞不只是舞台上的怒吼，而是一条力量与克制彼此追问的路。"},
  simayi:{introBridge:"你不急着回应挑衅，而是保存实力等待能改变结构的时机。耐心能减少无谓损失，隐藏意图太久也会让信任变成控制。",timelineBridge:"从平孟达到辽东、再到高平陵，司马懿并非只靠一个“忍”字；军事效率、权力行动与历史代价必须放在一起看。"},
  yuanshao:{introBridge:"你能聚起资源、声望和不同声音；越是如此，越需要明确何时该完成取舍。规模若没有决策规则，也会被自身重量拖住。",timelineBridge:"盟主、河北之主、官渡失利与身后分裂，袁绍的路不该只剩一次失败，而应看见聚势与失序如何相互发生。"},
  lvbu:{introBridge:"你对机会反应极快，也有冲开局面的本领。每次转身都会留下旧盟友的记忆，下一次机会因此先被衡量的往往是信用。",timelineBridge:"从丁原、董卓到兖徐与下邳，他不断改变战场，却没能让伙伴持续相信自己会站在同一边。"},
};
const baseContent={...(raw as Partial<Record<CharacterId,CharacterHistoricalContent>>),...expandedHistoricalContent} as Record<CharacterId,CharacterHistoricalContent>;
const allContent=Object.fromEntries(Object.entries(baseContent).map(([id,content])=>{const key=id as CharacterId;return [key,{...content,timeline:content.timeline.map((item,index)=>({...item,event:longformEvents[key][index]??item.event})),evaluations:content.evaluations.map((source,index)=>index===0?{...source,paraphrase:longformVoiceNotes[key]??source.paraphrase}:source)}];})) as Record<CharacterId,CharacterHistoricalContent>;
export const historicalContent=Object.fromEntries(Object.entries(allContent).map(([id,content])=>[id,{...content,...(content.introBridge?{}:bridgeCopy[id as CharacterId])}])) as Record<CharacterId,CharacterHistoricalContent>;
