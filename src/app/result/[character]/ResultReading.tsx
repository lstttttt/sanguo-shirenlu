"use client";

import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useSyncExternalStore } from "react";
import { ShareCard } from "@/components/ShareCard";
import { editorialCharacters, editorialCopy } from "@/data/editorial";
import type { CharacterId } from "@/data/questions";
import { readPersonalResultId, restartTestHref } from "@/lib/attempts";
import styles from "./result.module.css";

function subscribeToAttempt(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("pageshow", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("pageshow", onChange);
  };
}

function localResultId() {
  try {
    return readPersonalResultId(window.localStorage);
  } catch {
    return null;
  }
}

export function ResultReading({ characterId }: { characterId: CharacterId }) {
  const resultId = useSyncExternalStore(subscribeToAttempt, localResultId, () => null);
  const isPersonal = resultId === characterId;
  const person = editorialCharacters[characterId];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">{editorialCopy.homeTitle}</Link>
        <a className={styles.shareJump} href="#share">{editorialCopy.sharePage}</a>
      </header>
      <main className={styles.book}>
        <article className={isPersonal ? styles.personal : undefined}>
          <div className={styles.folio} aria-hidden="true">{person.chapterTitle}</div>
          <header className={styles.front}>
            <p className={styles.eyebrow}>
              {isPersonal ? editorialCopy.personalEyebrow : editorialCopy.publicEyebrow}
            </p>
            <h1>{person.name}</h1>
            <p className={styles.identity}>
              <span>字{person.courtesy}</span>
              <span>{person.identity}</span>
            </p>
            <p className={styles.frontLine}>{person.frontLine}</p>
          </header>
          {isPersonal && (
            <section className={styles.prose} aria-labelledby="mirror-heading">
              <h2 id="mirror-heading">{editorialCopy.mirrorHeading}</h2>
              {person.mirror.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          )}
          <section className={styles.prose} aria-labelledby="history-heading">
            <h2 id="history-heading">{person.chapterTitle}</h2>
            {person.history.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <details className={styles.sources}>
            <summary>
              {editorialCopy.sourceHeading}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <ul>
              {person.sources.map((source) => (
                <li key={source.label}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}<ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <p>{source.note}</p>
                </li>
              ))}
            </ul>
          </details>
        </article>
        <div className={styles.backMatter}>
          <ShareCard character={person} characterId={characterId} isPersonal={isPersonal} />
        </div>
      </main>
      <footer className={styles.footer}>
        <p>{editorialCopy.footer}</p>
        <Link className={styles.next} href={isPersonal ? restartTestHref : "/test"}>
          {isPersonal ? editorialCopy.restart : editorialCopy.publicStart}
        </Link>
      </footer>
    </div>
  );
}
