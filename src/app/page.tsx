import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { InkLandscape } from "@/components/InkLandscape";
import editorial from "@/data/sanguo-editorial.json";
import styles from "./home.module.css";

const copy = editorial.interface;

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.cover}>
        <h1 className={styles.title}>{copy.homeTitle}</h1>
        <p className={styles.intro}>
          {[copy.homeLead, copy.homeInstruction].map((sentence) => (
            <span className={styles.sentence} key={sentence}>
              {sentence.split(/(?<=，)/u).map((clause) => (
                <span className={styles.clause} key={clause}>{clause}</span>
              ))}
            </span>
          ))}
        </p>
        <p className={styles.meta}>{copy.homeMeta}</p>
        <Link href="/test" className={styles.start}>
          {copy.start}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.landscape}>
        <InkLandscape className={styles.ink} />
      </div>
    </main>
  );
}
