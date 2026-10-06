"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Feather, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { AncientButton } from "@/components/AncientButton";
import { InkLandscape } from "@/components/InkLandscape";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  const router = useRouter();
  return (
    <PageShell className="home-page">
      <div className="home-nav"><span>汉末人物志 · 借乱世照见取舍</span><span>公元 184—280 · 群雄行迹</span></div>
      <section className="hero">
        <motion.div className="hero__eyebrow" initial={false} animate={{ opacity: 1 }}>
          <span />汉末人物志 · 借乱世照见取舍<span />
        </motion.div>
        <motion.div className="hero__title-wrap" initial={false} animate={{ opacity: 1, y: 0 }}>
          <h1><span>三国</span><em>识人录</em></h1>
          <div className="hero__seal" aria-hidden="true">观<br/>心</div>
        </motion.div>
        <motion.p className="hero__slogan" initial={false} animate={{ opacity: 1 }}>
          一封军报 · 一位旧友 · 一座孤城
        </motion.p>
        <motion.p className="hero__intro" initial={false} animate={{ opacity: 1 }}>
          <b>若你身在汉末，一封军报、一位旧友、一座孤城摆到面前，你会怎么选？</b><br/>
          <span>36 道局中选择，对照 12 位人物的处事倾向。无需熟悉三国，按你会做的选。</span>
        </motion.p>
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
          <AncientButton tone="seal" onClick={() => router.push("/test")}>入局识人 <ArrowRight size={18}/></AncientButton>
          <p className="hero__meta">约 6–8 分钟 · 可回看修改 · 趣味人物对照</p>
        </motion.div>
      </section>
      <InkLandscape />
      <section className="method-strip" aria-label="测试特点">
        <div><BookOpen/><span><b>局中选择</b><small>按你愿承担的后果作答</small></span></div>
        <div><Feather/><span><b>每路皆有代价</b><small>题目借历史局势创作，不还原真实战事，也不作心理诊断。</small></span></div>
        <div><Landmark/><span><b>人物对照</b><small>结果是趣味人物倾向，不是人格定论</small></span></div>
      </section>
    </PageShell>
  );
}
