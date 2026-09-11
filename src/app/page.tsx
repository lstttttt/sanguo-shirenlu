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
      <div className="home-nav"><span>汉末人物精神图谱</span><span>据史而观 · 借古照今</span></div>
      <section className="hero">
        <motion.div className="hero__eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25 }}>
          <span />三十六问 · 十二原型<span />
        </motion.div>
        <motion.div className="hero__title-wrap" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <h1><span>三国</span><em>识人录</em></h1>
          <div className="hero__seal" aria-hidden="true">观<br/>心</div>
        </motion.div>
        <motion.p className="hero__slogan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .55 }}>
          一卷风云<br/><b>半部人心</b>
        </motion.p>
        <motion.p className="hero__intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }}>
          若置身汉末风云，你会如何决断、用人、守信与进退？<br/>循迹史册，寻找与你共鸣的精神原型。
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .85 }}>
          <AncientButton tone="seal" onClick={() => router.push("/test")}>启卷识人 <ArrowRight size={18}/></AncientButton>
          <p className="hero__meta">约 5 分钟 · 无对错之分 · 进度自动留存</p>
        </motion.div>
      </section>
      <InkLandscape />
      <section className="method-strip" aria-label="测试特点">
        <div><BookOpen/><span><b>据史为锚</b><small>不以演义标签定人</small></span></div>
        <div><Feather/><span><b>行为映照</b><small>观你真实的选择</small></span></div>
        <div><Landmark/><span><b>十二群像</b><small>允许双原型并存</small></span></div>
      </section>
    </PageShell>
  );
}
