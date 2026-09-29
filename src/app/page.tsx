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
      <div className="home-nav"><span>汉末人物精神图谱</span><span>公元 184—280 · 群雄行迹</span></div>
      <section className="hero">
        <motion.div className="hero__eyebrow" initial={false} animate={{ opacity: 1 }}>
          <span />据史而观 · 借古照今<span />
        </motion.div>
        <motion.div className="hero__title-wrap" initial={false} animate={{ opacity: 1, y: 0 }}>
          <h1><span>三国</span><em>识人录</em></h1>
          <div className="hero__seal" aria-hidden="true">观<br/>心</div>
        </motion.div>
        <motion.p className="hero__slogan" initial={false} animate={{ opacity: 1 }}>
          一卷风云<br/><b>半部人心</b>
        </motion.p>
        <motion.p className="hero__intro" initial={false} animate={{ opacity: 1 }}>
          <b>在利益、承诺与风险之间，</b><br/>你更常怎样做决定？<br/>
          <span>36 次选择，对照 12 位三国人物的处世结构。</span>
        </motion.p>
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
          <AncientButton tone="seal" onClick={() => router.push("/test")}>开始识人 <ArrowRight size={18}/></AncientButton>
          <p className="hero__meta">约 6–8 分钟 · 非心理测量 · 自动保存进度</p>
        </motion.div>
      </section>
      <InkLandscape />
      <section className="method-strip" aria-label="测试特点">
        <div><BookOpen/><span><b>从选择出发</b><small>不问你喜欢谁，只看你通常怎么做</small></span></div>
        <div><Feather/><span><b>不设标准答案</b><small>每种选择都有优势，也有相应代价</small></span></div>
        <div><Landmark/><span><b>允许双重原型</b><small>你可以同时接近两种人物结构</small></span></div>
      </section>
    </PageShell>
  );
}
