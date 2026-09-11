export function InkLandscape({ className = "" }: { className?: string }) {
  return (
    <svg className={`ink-landscape ${className}`} viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="inkFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#52636a" stopOpacity="0" />
          <stop offset="1" stopColor="#1c1b18" stopOpacity=".82" />
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <path d="M0 520 Q120 380 245 518 T490 500 T720 475 T960 510 T1200 430 V700 H0Z" fill="#52636a" opacity=".12" filter="url(#soft)" />
      <path d="M-20 606 Q100 460 205 565 Q320 390 420 570 Q530 440 650 575 Q790 390 900 570 Q1030 455 1230 560 V700 H-20Z" fill="url(#inkFade)" opacity=".35" />
      <path d="M0 635 Q170 560 315 625 T590 610 T860 620 T1200 580 V700 H0Z" fill="#1c1b18" opacity=".34" />
      <g stroke="#1c1b18" strokeWidth="3" opacity=".42">
        <path d="M900 570v-190m0 45-52-48m52 78 62-55m-62 4-22-88m22 64 43-105" />
        <path d="M180 606v-120m0 30-35-35m35 53 47-44m-47 3-14-58m14 42 33-75" />
      </g>
      <g fill="#9b2c2c" opacity=".55"><circle cx="897" cy="312" r="4"/><circle cx="941" cy="275" r="3"/><circle cx="177" cy="430" r="3"/></g>
    </svg>
  );
}
