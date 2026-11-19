export function InkLandscape({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 280 1200 420"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ridge-ink" x2="0" y2="1">
          <stop stopColor="#727B6B" stopOpacity=".19" />
          <stop offset="1" stopColor="#4D574A" stopOpacity=".38" />
        </linearGradient>
        <linearGradient id="foreground-ink" x2="0" y2="1">
          <stop stopColor="#5A6356" stopOpacity=".30" />
          <stop offset="1" stopColor="#777C69" stopOpacity=".24" />
        </linearGradient>
        <filter id="ridge-mist"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <path
        d="M0 520 Q120 380 245 518 T490 500 T720 475 T960 510 T1200 430 V700 H0Z"
        fill="#687662"
        opacity=".14"
        filter="url(#ridge-mist)"
      />
      <path
        d="M-20 606 Q100 460 205 565 Q320 390 420 570 Q530 440 650 575 Q790 390 900 570 Q1030 455 1230 560 V700 H-20Z"
        fill="url(#ridge-ink)"
      />
      <path
        d="M0 635 Q170 560 315 625 T590 610 T860 620 T1200 580 V700 H0Z"
        fill="url(#foreground-ink)"
      />
      <g fill="none" stroke="#4D574A" strokeWidth="3" strokeLinecap="round" opacity=".32">
        <path d="M900 621V380m0 45-52-48m52 78 62-55m-62 4-22-88m22 64 43-105" />
        <path d="M180 606V486m0 30-35-35m35 53 47-44m-47 3-14-58m14 42 33-75" />
      </g>
    </svg>
  );
}
