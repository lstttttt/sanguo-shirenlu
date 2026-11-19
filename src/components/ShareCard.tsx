"use client";

import { Download, Link2, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { editorialCopy as copy } from "@/data/editorial";
import type { CharacterId } from "@/data/questions";
import styles from "./ShareCard.module.css";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const CARD_MARGIN = 96;
const LINE_LENGTH = 18;
const SITE_HOST = "sanguo-shirenlu.vercel.app";
const SVG_NS = "http://www.w3.org/2000/svg";
const EXPORT_FONT = "SanguoCardSerif";
const CARD_PALETTE = {
  paper: "#F7F3E9",
  ink: "#262922",
  muted: "#555B50",
  seal: "#873E34",
  line: "#C9C2B1",
};

type CardCharacter = {
  name: string;
  courtesy: string;
  chapterTitle: string;
  frontLine: string;
};

type Action = "save" | "share" | "copy";

function wrapFrontLine(text: string) {
  const characters = Array.from(text);
  const lines: string[] = [];
  const breakAfter = /[，。；！？」』]/u;
  const keepAtEnd = /[，。、；：！？」』》）]/u;

  for (let start = 0; start < characters.length; ) {
    let end = Math.min(start + LINE_LENGTH, characters.length);
    if (end < characters.length) {
      const remaining = characters.length - start;
      const lineCount = Math.ceil(remaining / LINE_LENGTH);
      const evenBreak = start + Math.ceil(remaining / lineCount);
      const earliestBreak = Math.max(evenBreak - 4, characters.length - (lineCount - 1) * LINE_LENGTH);
      const latestBreak = Math.min(evenBreak + 4, end);
      let phraseBreak: number | undefined;
      for (let cut = earliestBreak; cut <= latestBreak; cut++) {
        if (
          breakAfter.test(characters[cut - 1]) &&
          !keepAtEnd.test(characters[cut]) &&
          (phraseBreak === undefined || Math.abs(cut - evenBreak) < Math.abs(phraseBreak - evenBreak))
        ) {
          phraseBreak = cut;
        }
      }
      end = phraseBreak ?? Math.min(end, evenBreak + 1);
      // Keep punctuation with the preceding phrase when a line must break mid-phrase.
      while (end > start + 1 && keepAtEnd.test(characters[end])) end--;
    }
    lines.push(characters.slice(start, end).join(""));
    start = end;
  }
  return lines;
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function renderPng(svg: SVGSVGElement) {
  await document.fonts.ready;
  const font = await fetch("/fonts/noto-serif-sc-card.woff2");
  if (!font.ok) throw new Error("Card font unavailable");

  const standaloneSvg = svg.cloneNode(true) as SVGSVGElement;
  const fontSource = await readAsDataUrl(await font.blob());
  const fontUrl = `url("${fontSource}")`;
  await new FontFace(EXPORT_FONT, fontUrl, { weight: "400 700" }).load();
  const style = document.createElementNS(SVG_NS, "style");
  style.textContent = `@font-face {
    font-family: ${EXPORT_FONT};
    font-weight: 400 700;
    src: ${fontUrl} format("woff2");
  }`;
  standaloneSvg.prepend(style);
  standaloneSvg.setAttribute("font-family", `${EXPORT_FONT}, serif`);
  const markup = new XMLSerializer().serializeToString(standaloneSvg);
  const imageUrl = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");

    context.drawImage(image, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (png) => (png ? resolve(png) : reject(new Error("PNG encoding failed"))),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function downloadPng(png: Blob, filename: string) {
  const url = URL.createObjectURL(png);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function ShareCard({
  character,
  characterId,
  isPersonal,
}: {
  character: CardCharacter;
  characterId: CharacterId;
  isPersonal: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const activeAction = useRef<Action | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [status, setStatus] = useState("");
  const { name, courtesy, chapterTitle, frontLine } = character;
  const cardLabel = isPersonal ? copy.personalCardLabel : copy.publicCardLabel;
  const lines = wrapFrontLine(frontLine);

  function publicUrl() {
    return new URL(`/result/${characterId}`, window.location.origin).href;
  }

  async function copyPublicUrl() {
    await navigator.clipboard.writeText(publicUrl());
    return copy.copied;
  }

  async function sharePublicPage() {
    const data = {
      title: copy.homeTitle,
      text: `${name} · ${chapterTitle}\n${frontLine}`,
      url: publicUrl(),
    };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return "";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "";
      }
    }
    return copyPublicUrl();
  }

  async function saveCard() {
    if (!svgRef.current) throw new Error("Card preview unavailable");
    const png = await renderPng(svgRef.current);
    downloadPng(png, `${copy.homeTitle}-${name}.png`);
    return copy.imageReady;
  }

  async function perform(action: Action, task: () => Promise<string>) {
    if (activeAction.current) return;
    activeAction.current = action;
    setPending(action);
    setStatus("");
    try {
      setStatus(await task());
    } catch {
      setStatus(action === "save" ? copy.imageError : copy.copyError);
    } finally {
      activeAction.current = null;
      setPending(null);
    }
  }

  const cardRight = CARD_WIDTH - CARD_MARGIN;
  return (
    <section id="share" className={styles.section} aria-labelledby="share-heading">
      <h2 id="share-heading">{copy.shareHeading}</h2>
      <div className={styles.layout}>
        <svg
          id="share-card-svg"
          ref={svgRef}
          className={styles.preview}
          xmlns={SVG_NS}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
          role="img"
          aria-label={`${cardLabel}，${name}，字${courtesy}，${chapterTitle}。${frontLine}`}
          fill={CARD_PALETTE.ink}
        >
          <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill={CARD_PALETTE.paper} />
          <text x={CARD_MARGIN} y="131" fontSize="36" fontWeight="600" fill={CARD_PALETTE.seal}>
            {copy.homeTitle}
          </text>
          <rect x={cardRight - 186} y="88" width="186" height="58" fill="none" stroke={CARD_PALETTE.seal} />
          <text x={cardRight - 93} y="127" fontSize="28" textAnchor="middle" fill={CARD_PALETTE.seal}>
            {cardLabel}
          </text>
          <path
            d={`M${CARD_MARGIN} 192H${cardRight} M${CARD_MARGIN} 1272H${cardRight}`}
            fill="none"
            stroke={CARD_PALETTE.line}
            strokeWidth="2"
          />
          <text x={CARD_MARGIN} y="479" fontSize="158" fontWeight="600" letterSpacing="6">
            {name}
          </text>
          <text x={CARD_MARGIN + 6} y="568" fontSize="43" fill={CARD_PALETTE.muted}>
            字{courtesy}
          </text>
          <path d={`M${CARD_MARGIN} 692h72`} stroke={CARD_PALETTE.seal} strokeWidth="4" />
          <text x={CARD_MARGIN} y="794" fontSize="55" fontWeight="600">
            {chapterTitle}
          </text>
          <text fontSize="48">
            {lines.map((line, index) => (
              <tspan key={index} x={CARD_MARGIN} y={905 + index * 82}>{line}</tspan>
            ))}
          </text>
          <text x={CARD_MARGIN} y="1340" fontSize="30" fill={CARD_PALETTE.muted}>
            {SITE_HOST}
          </text>
        </svg>
        <div className={styles.details}>
          <p className={styles.note}>{copy.publicShareNote}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              aria-disabled={pending !== null}
              aria-busy={pending === "save"}
              onClick={() => perform("save", saveCard)}
            >
              <Download size={16} aria-hidden="true" />
              {copy.saveCard}
            </button>
            <button
              type="button"
              className={styles.secondary}
              aria-disabled={pending !== null}
              aria-busy={pending === "share"}
              onClick={() => perform("share", sharePublicPage)}
            >
              <Share2 size={16} aria-hidden="true" />
              {copy.sharePage}
            </button>
            <button
              type="button"
              className={styles.tertiary}
              aria-disabled={pending !== null}
              aria-busy={pending === "copy"}
              onClick={() => perform("copy", copyPublicUrl)}
            >
              <Link2 size={16} aria-hidden="true" />
              {copy.copyLink}
            </button>
          </div>
          <p className={styles.status} role="status">{status}</p>
        </div>
      </div>
    </section>
  );
}
