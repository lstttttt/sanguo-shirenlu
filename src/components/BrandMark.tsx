import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} href="/" aria-label="返回三国识人录首页">
      <span className="brand-mark__seal">识</span>
      <span>
        <b>三国识人录</b>
        {!compact && <small>一卷风云 · 半部人心</small>}
      </span>
    </Link>
  );
}
