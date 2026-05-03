
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Droplets,
  Flame,
  Leaf,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import Image from "next/image";
import { AyurNav, DoshaRadialChart, HeroMandala, requireLogin, useAyurUser } from "@/components/ui/ayur-ui";

const doshas = [
  {
    key: "vata",
    name: "Vata",
    element: "Air & Ether",
    description: "Governs movement, creativity, and communication. When balanced, it brings vitality and mental clarity.",
    tags: ["Creative", "Light", "Quick", "Airy"],
    icon: Wind,
    color: "#7B72B0",
    bg: "#EDEAF7",
    bar: "from-[#C9C2E0] to-[#A8B5E5]",
  },
  {
    key: "pitta",
    name: "Pitta",
    element: "Fire & Water",
    description: "Governs transformation, metabolism, and intelligence. When balanced, it brings sharp focus and leadership.",
    tags: ["Focused", "Warm", "Sharp", "Bold"],
    icon: Flame,
    color: "#C47830",
    bg: "#FBE9D7",
    bar: "from-[#E6A15A] to-[#D4856A]",
  },
  {
    key: "kapha",
    name: "Kapha",
    element: "Earth & Water",
    description: "Governs structure, stability, and nurturing. When balanced, it brings endurance and compassion.",
    tags: ["Grounded", "Steady", "Calm", "Strong"],
    icon: Droplets,
    color: "#4A8B6A",
    bg: "#E4F1EA",
    bar: "from-[#6FAF8F] to-[#4A8B6A]",
  },
];

const steps = [
  {
    title: "Upload your images",
    description: "Begin with a clear facial image and an optional tongue image so the system can read visual patterns.",
  },
  {
    title: "Share your patterns",
    description: "Provide your symptoms, history, duration, and location, then answer personalized follow-up questions.",
  },
  {
    title: "Receive your Prakriti",
    description: "Your dosha balance is generated with a calm, structured overview of the constitution signals.",
  },
  {
    title: "Review your guidance",
    description: "See lifestyle, routine, yoga, herbs, and safety guidance grounded in the information you provided.",
  },
];

const faqs = [
  {
    question: "What images should I upload?",
    answer: "Upload a clear face photo with natural lighting and a neutral expression. A tongue image is optional but helps provide a deeper Ayurvedic reading.",
  },
  {
    question: "Is AyurVision a medical diagnosis?",
    answer: "No. AyurVision provides educational Ayurvedic insights only. Please consult a qualified healthcare professional before making medical decisions.",
  },
  {
    question: "How long does the assessment take?",
    answer: "Most users complete the upload, information form, generated questions, and report generation in about five to ten minutes.",
  },
  {
    question: "Can I view my previous reports?",
    answer: "Yes. Logged-in users can open Results from the navbar to review their saved reports.",
  },
];

export default function AyurVisionLanding() {
  const router = useRouter();
  const { user, setUser } = useAyurUser();
  const [openFaq, setOpenFaq] = useState(0);

  const beginAssessment = () => {
    if (user) router.push("/diagnosis");
    else requireLogin(router, "Please log in first to begin your assessment.");
  };

  const openResults = () => {
    if (user) router.push("/history");
    else requireLogin(router, "Please log in first to view your results.");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
      <AyurNav user={user} onUserChange={setUser} />

      <main className="overflow-hidden pt-[72px]">
        <section className="relative px-5 py-20 sm:px-8 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#F7F3EE_0%,#EFE8DF_100%)]" />
          <div className="av-shell grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#B8D9C7] bg-[#E4F1EA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#4A8B6A]">
                <Leaf className="h-3.5 w-3.5" />
                AI-powered Ayurvedic intelligence
              </div>
              <h1 className="font-display text-[42px] font-semibold leading-[1.12] text-[#2F2F2F] sm:text-[56px] lg:text-[64px]">
                Discover Your <span className="italic text-[#6FAF8F]">Ayurvedic</span> Constitution
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#6B6B6B]">
                Understand your natural balance through intelligent face and tongue analysis rooted in Ayurvedic principles. A personalized guide, not a diagnosis.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={beginAssessment}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#6FAF8F] px-7 py-4 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(111,175,143,0.34)] transition hover:-translate-y-0.5 hover:bg-[#4A8B6A]"
                >
                  <Leaf className="h-4 w-4" />
                  Begin Assessment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-12 flex max-w-md items-center gap-4 text-sm leading-6 text-[#6B6B6B]">
                <div className="flex -space-x-2">
                  {[Wind, Flame, Droplets, Sparkles].map((Icon, index) => (
                    <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F7F3EE] bg-white text-[#6FAF8F]">
                      <Icon className="h-4 w-4" />
                    </span>
                  ))}
                </div>
                <p>
                  <strong className="text-[#2F2F2F]">Traditional Ayurvedic principles.</strong>
                  <br />
                  Indicative analysis for self-understanding.
                </p>
              </div>
            </div>

            {/* Replace the existing hero mandala block with this larger version */}
            <div className="relative flex min-h-[500px] items-center justify-center lg:min-h-[600px]">
              {/* Increased mandala size for mobile (380px) and large screens (580px) */}
              <HeroMandala className="h-[380px] w-[380px] lg:h-[580px] lg:w-[580px]" />
            </div>
          </div>
        </section>

        <section id="doshas" className="av-section bg-[#EFE8DF]">
          <div className="av-shell">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">The Three Doshas</p>
            <h2 className="font-display max-w-xl text-4xl font-semibold leading-tight text-[#2F2F2F]">The forces that shape your nature</h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#6B6B6B]">
              Ayurveda holds that every person is a unique combination of Vata, Pitta, and Kapha, shaping body, mind, and spirit.
            </p>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {doshas.map((dosha) => {
                const Icon = dosha.icon;
                return (
                  <article key={dosha.key} className="av-card group relative overflow-hidden p-8 transition hover:-translate-y-1 hover:shadow-[0_12px_34px_rgba(47,47,47,0.1)]">
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${dosha.bar}`} />
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: dosha.bg, color: dosha.color }}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold" style={{ color: dosha.color }}>{dosha.name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">{dosha.element}</p>
                    <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">{dosha.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {dosha.tags.map((tag) => (
                        <span key={tag} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: dosha.bg, color: dosha.color }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="av-section">
          <div className="av-shell">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">The Process</p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F]">A guided journey, not a form</h2>
              <p className="mt-4 text-base leading-8 text-[#6B6B6B]">
                Your assessment moves in calm steps - image upload, profile details, personalized questions, then a readable report.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {steps.map((step, index) => (
                <article key={step.title} className="av-card flex gap-6 p-8 transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(47,47,47,0.09)]">
                  <div className="font-display w-14 shrink-0 text-5xl font-semibold leading-none text-[#E4DCD2]">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#2F2F2F]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="av-section bg-[#EFE8DF]">
          <div className="av-shell grid gap-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Before You Begin</p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F]">Important instructions</h2>
              <p className="mt-4 text-base leading-8 text-[#6B6B6B]">
                Clear inputs create better insights. Please read these notes before starting your assessment.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: Camera, title: "Use clear, natural images", text: "Avoid filters, harsh shadows, heavy makeup, and cropped photos. Keep your face visible and centered." },
                { icon: ClipboardList, title: "Answer honestly", text: "Your symptoms, duration, treatment history, and question answers directly shape the report." },
                { icon: AlertTriangle, title: "Educational guidance only", text: "This report does not diagnose, treat, or cure medical conditions. Consult a qualified professional for care." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="av-card flex gap-4 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EA] text-[#4A8B6A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2F2F2F]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="av-section">
          <div className="av-shell max-w-4xl">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Questions</p>
              <h2 className="font-display text-4xl font-semibold text-[#2F2F2F]">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={faq.question} className="av-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="font-semibold text-[#2F2F2F]">{faq.question}</span>
                    {openFaq === index ? <ChevronUp className="h-5 w-5 text-[#6B6B6B]" /> : <ChevronDown className="h-5 w-5 text-[#6B6B6B]" />}
                  </button>
                  {openFaq === index && <p className="px-6 pb-6 text-sm leading-7 text-[#6B6B6B]">{faq.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="av-section bg-[#F7F3EE]">
          <div className="av-shell">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Your Prakriti</p>
              <h2 className="font-display text-4xl font-semibold text-[#2F2F2F]">Sample results overview</h2>
              <p className="mt-4 text-base leading-8 text-[#6B6B6B]">
                This preview shows the report style. Your actual results are generated from your uploaded images and answers.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.15fr]">
              <div className="av-card p-8 text-center">
                <h3 className="font-display text-xl font-semibold text-[#2F2F2F]">Your Balance</h3>
                <p className="mt-1 text-sm text-[#6B6B6B]">Based on assessment inputs</p>
                <div className="my-8">
                  <DoshaRadialChart doshas={{ vata: 20, pitta: 42, kapha: 65 }} label="Vata-Kapha" />
                </div>
                <div className="space-y-4 text-left">
                  <DoshaBar label="Kapha" level="Dominant" value={65} color="#6FAF8F" />
                  <DoshaBar label="Pitta" level="Moderate" value={42} color="#E6A15A" />
                  <DoshaBar label="Vata" level="Low" value={20} color="#C9C2E0" />
                </div>
              </div>

              <div className="av-card p-8 lg:p-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#B8D9C7] bg-[#E4F1EA] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#4A8B6A]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Indicative Analysis
                </div>
                <h3 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F]">
                  Your Prakriti:
                  <br />
                  <span className="text-[#6FAF8F]">Vata-Kapha</span>
                </h3>
                <p className="mt-5 border-b border-[#E4DCD2] pb-7 text-[15px] leading-8 text-[#6B6B6B]">
                  This constitution reflects a blend of Vata lightness and Kapha groundedness, with creative bursts supported by a need for steadiness and recovery.
                </p>
                <div className="mt-7 space-y-7">
                  <Reco title="Foods to favour" color="#6FAF8F" items={["Warm, cooked meals with mild spices", "Light grains like quinoa and millet", "Bitter greens and astringent vegetables"]} />
                  <Reco title="Daily rhythms" color="#E6A15A" items={["Rise with the sun and begin with gentle movement", "Avoid oversleeping when Kapha feels heavy", "Wind down with warm oil self-massage"]} />
                  <Reco title="Lifestyle adjustments" color="#C9C2E0" items={["Use routine to ground Vata's irregularity", "Favour invigorating exercise to counter inertia"]} />
                </div>
                <div className="mt-8 rounded-2xl bg-[#EFE8DF] p-4 text-sm italic leading-7 text-[#6B6B6B]">
                  This analysis is indicative and based on your inputs. It is not a medical diagnosis.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="av-section text-center">
          <div className="av-shell max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Begin your journey</p>
            <h2 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F] sm:text-5xl">
              Discover the balance <span className="italic text-[#6FAF8F]">within you</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#6B6B6B]">
              Take the first step toward a clearer view of your constitution and wellness patterns.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={beginAssessment}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#6FAF8F] px-7 py-4 text-sm font-semibold text-white shadow-[0_8px_26px_rgba(111,175,143,0.3)] transition hover:bg-[#4A8B6A]"
              >
                <Leaf className="h-4 w-4" />
                Begin Your Assessment
              </button>
              <button
                type="button"
                onClick={openResults}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E4DCD2] bg-white px-7 py-4 text-sm font-semibold text-[#2F2F2F] transition hover:border-[#6B6B6B]"
              >
                <BookOpen className="h-4 w-4" />
                View Results
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#2F2F2F] px-5 py-12 text-white/70 sm:px-8">
        <div className="av-shell grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="font-display text-2xl font-semibold text-white">Ayu<span className="text-[#6FAF8F]">r</span>Vision</div>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/55">
              An intelligent Ayurvedic guide for wellness awareness. Not a medical service.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Explore</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/#doshas" className="hover:text-white">Doshas</Link>
              <Link href="/#how" className="hover:text-white">How it works</Link>
              <button type="button" onClick={openResults} className="text-left hover:text-white">Results</button>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Trust</p>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#6FAF8F]" /> Privacy minded</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#6FAF8F]" /> Education first</p>
            </div>
          </div>
        </div>
        <div className="av-shell mt-7 flex flex-col justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <span>2026 AyurVision. Wellness guidance, not medical advice.</span>
          <span>Rooted in tradition. Guided by intelligence.</span>
        </div>
      </footer>
    </div>
  );
}

function DoshaBar({ label, level, value, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#2F2F2F]">{label}</span>
        <span className="text-xs text-[#6B6B6B]">{level}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EFE8DF]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Reco({ title, color, items }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6B6B]">{title}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[#6B6B6B]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
