import type { Character } from "@/data/characters";

export function Portrait({ character }: { character: Character }) {
  return (
    <div className="portrait" style={{"--tone": character.tone} as React.CSSProperties}>
      <div className="portrait__sun" />
      <div className="portrait__ink portrait__ink--one" />
      <div className="portrait__ink portrait__ink--two" />
      <svg viewBox="0 0 360 480" aria-label={`${character.name}意象剪影`} role="img">
        <g fill="none" stroke="var(--tone)" strokeWidth="2" opacity=".7">
          <path d="M32 96Q92 42 156 86T306 52" strokeDasharray="5 7"/><path d="M48 128Q118 94 170 120T318 91"/>
          <circle cx="32" cy="96" r="5" fill="var(--tone)"/><circle cx="156" cy="86" r="5" fill="var(--tone)"/><circle cx="306" cy="52" r="5" fill="var(--tone)"/>
        </g>
        <path d="M115 430c7-77 7-121 31-155 10-14 18-28 19-49-18-14-28-43-25-72 3-36 19-69 42-69s41 33 43 69c2 30-9 58-27 72 2 21 12 35 23 49 26 33 31 78 38 155Z" fill="#171715" opacity=".92"/>
        <path d="M136 142c4-43 17-75 46-78 30 4 42 36 45 78-16-22-29-31-44-34-15 4-31 14-47 34Z" fill="#171715"/>
        <path d="M139 106c12-33 31-50 44-50s34 18 45 51c-17-13-31-17-45-17s-27 4-44 16Z" fill="var(--tone)" opacity=".9"/>
        <path d="M154 67Q183 43 212 67L206 83H160Z" fill="#171715"/>
        <path d="M113 429c18-55 42-92 70-111 30 21 55 58 74 111" fill="none" stroke="var(--tone)" strokeWidth="5" opacity=".65"/>
        <path d="M151 172c8 4 15 4 22 0m20 0c8 4 15 4 22 0M180 190c3 2 7 2 10 0" fill="none" stroke="#eee7d7" strokeWidth="3" opacity=".48"/>
      </svg>
      <div className="portrait__caption"><span>{character.era}</span><b>{character.portrait}</b></div>
    </div>
  );
}
