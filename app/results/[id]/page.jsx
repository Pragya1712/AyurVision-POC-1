"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Info,
    Loader2,
    Maximize2,
    PanelRightOpen,
    Plus,
    X,
    ChevronLeft,
    ChevronDown,
    ArrowLeft
} from "lucide-react";
import { AyurNav, DoshaRadialChart } from "@/components/ui/ayur-ui";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

const DOSHA_META = {
    vata: { label: "Vata", color: "#C9C2E0", soft: "#EDEAF7", dark: "#7B72B0" },
    pitta: { label: "Pitta", color: "#E6A15A", soft: "#FBE9D7", dark: "#C47830" },
    kapha: { label: "Kapha", color: "#6FAF8F", soft: "#E4F1EA", dark: "#4A8B6A" },
};

export default function ReportResult({ params }) {
    const router = useRouter();
    const [user, setUser] = useState({ name: "Loading...", id: "" });
    const [report, setReport] = useState(null);
    const [dbRecord, setDbRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const unwrappedParams = use(params);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = window.localStorage.getItem("ayurUser");
            const token = window.localStorage.getItem("ayurToken");
            if (!storedUser || !token) {
                window.sessionStorage.setItem("ayurAuthNotice", "Please log in first to view your results.");
                router.push("/auth");
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser);
                setTimeout(() => setUser(parsedUser), 0);
            } catch (e) {
                console.error("Corrupted user data", e);
                window.localStorage.removeItem("ayurUser");
                window.localStorage.removeItem("ayurToken");
                router.push("/auth");
            }
        }
    }, [router]);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/reports/${unwrappedParams.id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to fetch report");

                if (data.success && data.data && data.data.finalReport) {
                    setDbRecord(data.data);
                    setReport(data.data.finalReport);
                } else {
                    setApiError("Report generation is still pending or failed.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setApiError("Connection error while fetching the report.");
            } finally {
                setLoading(false);
            }
        };

        if (unwrappedParams?.id) fetchReport();
    }, [unwrappedParams.id]);

    const handleDownloadPDF = () => {
        if (!report || !dbRecord) return;

        const doc = new jsPDF();
        let y = 20;
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;

        const addWrappedText = (text, isBold = false, fontSize = 12) => {
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(String(text || ""), maxLineWidth);

            if (y + lines.length * 7 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }

            doc.text(lines, margin, y);
            y += lines.length * 7 + 5;
        };

        addWrappedText("AyurVision - Ayurvedic Insights Report", true, 18);
        y += 5;
        addWrappedText(`Patient ID: ${report.reportId || dbRecord._id}`, false, 10);
        addWrappedText(`Date: ${new Date(dbRecord.createdAt).toLocaleDateString()}`, false, 10);
        addWrappedText(`Patient: ${dbRecord.demographics.age} years | ${dbRecord.demographics.gender} | ${dbRecord.demographics.city}`, false, 10);
        y += 5;

        addWrappedText("1. Overview", true, 14);
        addWrappedText(report.summary?.overview || "No overview available.");
        y += 5;

        addWrappedText("2. Action Plan", true, 14);
        if (report.recommendations) {
            if (report.recommendations.immediate?.length) addWrappedText(`Immediate: ${report.recommendations.immediate.join(", ")}`);
            if (report.recommendations.selfCare?.length) addWrappedText(`Self-Care: ${report.recommendations.selfCare.join(", ")}`);
            if (report.recommendations.lifestyle?.length) addWrappedText(`Lifestyle: ${report.recommendations.lifestyle.join(", ")}`);
        }
        y += 5;

        addWrappedText("3. Akriti Parikshan (Face & Clinical Insights)", true, 14);
        if (report.diagnoses && report.diagnoses.length > 0) {
            report.diagnoses.forEach((cond) => {
                addWrappedText(`${cond.condition} (Confidence: ${cond.confidence}%)`, true, 12);
                addWrappedText(cond.description);
            });
        } else {
            addWrappedText("Healthy / Balanced State. No active conditions detected.");
        }
        y += 5;

        if (report.tongue_analysis && report.tongue_analysis.provided) {
            addWrappedText("4. Jihva Parikshan (Tongue Insights)", true, 14);
            report.tongue_analysis.observations?.forEach((obs) => addWrappedText(`- ${obs}`));
            addWrappedText(`Skin & Gut Correlation: ${report.tongue_analysis.dosha_correlation}`);
            addWrappedText(`Agni (Digestion): ${report.tongue_analysis.agni_state}`);
            addWrappedText(`Ama (Toxins): ${report.tongue_analysis.ama_state}`);
            y += 5;
        }

        addWrappedText("5. Lifestyle, Routine & Yoga", true, 14);
        report.daily_routine?.forEach((item) => addWrappedText(`${item.heading}: ${item.detail}`));
        report.yoga_asanas?.forEach((item) => addWrappedText(`${item.heading}: ${item.detail}`));
        y += 5;

        addWrappedText("6. Safe Herbs", true, 14);
        report.herbs?.forEach((item) => addWrappedText(`${item.heading}: ${item.detail}`));
        y += 5;

        addWrappedText("7. Usage & Application", true, 14);
        report.herb_usage?.forEach((item) => addWrappedText(`${item.heading}: ${item.detail}`));

        doc.save(`Ayurvedic_Report_${report.reportId || "Patient"}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
                <AyurNav user={user} onUserChange={setUser} active="results" />
                <div className="grid min-h-screen place-items-center pt-20">
                    <div className="flex items-center gap-3 text-[#4A8B6A]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-semibold">Loading Ayurvedic insights...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
                <AyurNav user={user} onUserChange={setUser} active="results" />
                <div className="mx-auto grid min-h-screen max-w-xl place-items-center px-5 pt-20 text-center">
                    <div className="av-card p-8">
                        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-[#C47830]" />
                        <h1 className="font-display text-2xl font-semibold">Unable to load report</h1>
                        <p className="mt-3 text-[#6B6B6B]">{apiError}</p>
                    </div>
                </div>
            </div>
        );
    }

    const doshas = report?.doshas || { vata: 0, pitta: 0, kapha: 0 };
    const balanceLabel = getBalanceLabel(doshas);
    const diagnosisCount = report.diagnoses?.length || 0;

    return (
        <div className="min-h-screen bg-[#F7F3EE] pb-20 text-[#2F2F2F] print:bg-white">
            <AyurNav user={user} onUserChange={setUser} active="results" />

            <main className="mx-auto max-w-7xl px-5 pt-28 sm:px-8 print:pt-6">
                <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#E4DCD2] pb-8 md:flex-row md:items-end print:hidden">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Report Overview</p>
                        <h1 className="font-display text-4xl font-semibold text-[#2F2F2F]">Ayurvedic Insights</h1>
                        <p className="mt-2 text-sm font-medium text-[#6B6B6B]">
                            Report ID: {report.reportId || dbRecord._id} | Date: {new Date(dbRecord.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleDownloadPDF} variant="outline" className="h-11 rounded-2xl border-[#B8D9C7] bg-white font-semibold text-[#4A8B6A] hover:bg-[#E4F1EA]">
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                        <Link href="/diagnosis">
                            <Button className="h-11 rounded-2xl bg-[#6FAF8F] font-semibold text-white hover:bg-[#4A8B6A]">
                                <Plus className="mr-2 h-4 w-4" /> New Analysis
                            </Button>
                        </Link>
                    </div>
                </header>
                {/* Single Scrollbar Layout Grid[cite: 1] */}
                <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">

                    {/* LEFT SIDE: Sticky Dosha Meter (Chevron Removed from here)
                    <aside className="lg:sticky lg:top-28 space-y-6 print:hidden">
                        <section className="av-card p-7 text-center relative">
                            <h2 className="font-display text-xl font-semibold text-[#2F2F2F]">Relative Dosha Meter</h2>
                            <p className="mt-1 text-xs text-[#6B6B6B]">Estimated deviation from current observations</p>
                            <div className="my-8 flex justify-center">
                                <DoshaRadialChart doshas={doshas} label={balanceLabel} caption="Balance" />
                            </div>
                            <div className="space-y-4 text-left">
                                {Object.entries(DOSHA_META).map(([key, meta]) => (
                                    <DoshaBar key={key} label={meta.label} value={doshas[key] || 0} level={getDoshaRank(key, doshas)} color={meta.color} />
                                ))}
                            </div>

                            {report.imbalance_explanation && (
                                <div className="mt-8 text-left border-t border-[#E4DCD2] pt-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9F9386] mb-3">Explanation:</p>
                                    <div className="rounded-2xl border border-[#B8D9C7] bg-[#E4F1EA] p-4 text-sm leading-7 text-[#4A8B6A]">
                                        {report.imbalance_explanation}
                                    </div>
                                </div>
                            )}
                        </section>
                    </aside> */}

                    {/* LEFT SIDE: Sticky Dosha Meter */}
                    <aside className="lg:sticky lg:top-28 space-y-6 print:hidden">
                        <section className="av-card p-7 text-center relative">

                            {/* UPDATED: Title reflects Vikriti (Current State) */}
                            <h2 className="font-display text-xl font-semibold text-[#2F2F2F]">Current Imbalance Meter</h2>
                            <p className="mt-1 text-xs text-[#6B6B6B]">Your estimated Vikriti deviation</p>

                            {/* NEW: Displays the Baseline Prakriti above the chart */}
                            {/* NEW: Displays the Baseline Prakriti with Hover Tooltip */}
                            {report.prakriti_hypothesis && (
                                <div className="group relative mt-5 inline-block cursor-help rounded-full border border-[#E4DCD2] bg-[#F7F3EE] px-4 py-2 shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] mr-2">Baseline Prakriti [Hypothetical]:</span>
                                    <br></br>
                                    <span className="text-sm font-semibold text-[#2F2F2F]">{report.prakriti_hypothesis}</span>

                                    {/* TOOLTIP ON HOVER - THEMED */}
                                    <div className="absolute left-1/2 top-full z-50 mt-3 hidden w-64 -translate-x-1/2 rounded-2xl border border-[#E4DCD2] bg-white p-4 text-left text-xs leading-5 text-[#6B6B6B] shadow-[0_10px_40px_rgba(47,47,47,0.08)] transition-all duration-300 group-hover:block group-hover:opacity-100 print:hidden">
                                        {/* Little upward-pointing triangle */}
                                        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#E4DCD2] bg-white"></div>

                                        {/* Tooltip Text */}
                                        <span className="relative z-10 block">
                                            <span className="font-bold text-[#4A8B6A] mb-1.5 block text-[13px]">Why this baseline?</span>
                                            {report.prakriti_explanation || "Deduced from your facial skeletal structure (Pramana) and lifelong physiological traits."}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="my-8 flex justify-center">
                                <DoshaRadialChart doshas={doshas} label={balanceLabel} caption="Vikriti" />
                            </div>
                            <div className="space-y-4 text-left">
                                {Object.entries(DOSHA_META).map(([key, meta]) => (
                                    <DoshaBar key={key} label={meta.label} value={doshas[key] || 0} level={getDoshaRank(key, doshas)} color={meta.color} />
                                ))}
                            </div>

                            {/* UPDATED: Imbalance Explanation is now a dropdown (accordion) */}
                            {report.imbalance_explanation && (
                                <div className="mt-8 text-left border-t border-[#E4DCD2] pt-6">
                                    <details className="group rounded-2xl border border-[#B8D9C7] bg-[#E4F1EA] overflow-hidden transition-all duration-300">
                                        <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-[#4A8B6A] outline-none hover:bg-[#D5E9DE]">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">View AI Analysis Logic</span>
                                            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm leading-7 text-[#4A8B6A] border-t border-[#B8D9C7]/50 mt-1 pt-3">
                                            {report.imbalance_explanation}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </section>
                    </aside>

                    {/* RIGHT SIDE: Report Content (No internal scrollbar) */}
                    <div className="space-y-6 pb-10">
                        {/* Chevron Right Button Fixed EXACTLY to the Screen Vertical Center / Edge */}
                        {/* SCREEN-EDGE FIXED CHEVRON BUTTON */}
                        {!detailsOpen && (
                            <button
                                onClick={() => setDetailsOpen(true)}
                                className="fixed right-0 top-2/3 -translate-y-1/2 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-[#2F2F2F] text-white shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-70 hidden lg:flex print:hidden"
                                title="View Assessment Details"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        )}

                        <ReportSection number="1" title="Overview" accent="#6FAF8F">
                            <p className="text-sm leading-8 text-[#6B6B6B]">{report.summary?.overview || "No overview available."}</p>
                        </ReportSection>

                        {report.recommendations && (
                            <ReportSection number="2" title="Action Plan" accent="#6FAF8F">
                                <div className="space-y-4">
                                    <RecommendationGroup title="Immediate" color="#C47830" items={report.recommendations.immediate} />
                                    <RecommendationGroup title="Self-Care" color="#7B72B0" items={report.recommendations.selfCare} />
                                    <RecommendationGroup title="Lifestyle" color="#4A8B6A" items={report.recommendations.lifestyle} />
                                </div>
                            </ReportSection>
                        )}


                        <ReportSection number="3" title="Akriti Parikshan (Face Insights)" accent="#C9C2E0">
                            <div className="space-y-5">
                                {report.diagnoses && report.diagnoses.length > 0 ? (
                                    report.diagnoses.map((cond, idx) => (
                                        <div key={idx} className="rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-5">
                                            <div className="mb-2 flex items-start justify-between gap-4">
                                                <h3 className="font-display text-xl font-semibold text-[#2F2F2F]">{cond.condition}</h3>
                                                <span className="rounded-full bg-[#E4F1EA] px-3 py-1 text-xs font-bold text-[#4A8B6A]">{cond.confidence}%</span>
                                            </div>
                                            <p className="text-sm leading-7 text-[#6B6B6B]">{cond.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-start gap-4 rounded-2xl border border-[#B8D9C7] bg-[#E4F1EA] p-5 text-[#4A8B6A]">
                                        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0" />
                                        <div>
                                            <h3 className="font-display text-xl font-semibold">Healthy & Balanced</h3>
                                            <p className="mt-1 text-sm leading-7">No active dermatological Vikriti imbalances were detected.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ReportSection>

                        {report.tongue_analysis && report.tongue_analysis.provided && (
                            <ReportSection number="4" title="Jihva Pariksha (Tongue Insights)" accent="#E6A15A">
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Visual Observations</h3>
                                        <ul className="space-y-2 text-sm leading-7 text-[#6B6B6B]">
                                            {report.tongue_analysis.observations?.map((obs, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E6A15A]" />
                                                    {obs}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-4 mt-5">
                                        <MiniInsight title="Skin & Gut Correlation" text={report.tongue_analysis.dosha_correlation} />
                                        <MiniInsight title="State of Agni" text={report.tongue_analysis.agni_state} />
                                        <MiniInsight title="State of Ama" text={report.tongue_analysis.ama_state} />
                                    </div>
                                </div>
                            </ReportSection>
                        )}

                        <ReportSection number="5" title="Lifestyle, Routine & Yoga" accent="#7B72B0">
                            <div className="space-y-5">
                                <ReportList title="Daily Routine" items={report.daily_routine} color="#6FAF8F" />
                                {report.yoga_asanas?.length > 0 && <ReportList title="Recommended Yoga Asanas" items={report.yoga_asanas} color="#C9C2E0" />}
                            </div>
                        </ReportSection>

                        <ReportSection number="6" title="Safe Herbs" accent="#6FAF8F">
                            <ReportList items={report.herbs} color="#6FAF8F" />
                        </ReportSection>

                        <ReportSection number="7" title="Usage & Application" accent="#E6A15A">
                            <div className="space-y-5">
                                <ReportList
                                    title="How to Take Medicine"
                                    items={report.herb_usage?.filter((item) => !item.heading.toLowerCase().includes("lepa"))}
                                    color="#E6A15A"
                                />
                                <ReportList
                                    title={
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span>Lepas (External Application)</span>
                                            <span className="flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600 shadow-sm">
                                                ⚠️ Do a patch test first
                                            </span>
                                        </div>
                                    }
                                    items={report.herb_usage?.filter((item) => item.heading.toLowerCase().includes("lepa"))}
                                    color="#E6A15A"
                                />
                            </div>
                        </ReportSection>

                        {/* Buttons moved ABOVE the Awareness/Warning messages[cite: 1] */}
                        <div className="flex flex-col gap-4 border-t border-[#E4DCD2] pt-8 sm:flex-row print:hidden">
                            <Button onClick={handleDownloadPDF} variant="outline" className="h-14 flex-1 rounded-2xl border-[#B8D9C7] bg-white font-semibold text-[#4A8B6A] hover:bg-[#E4F1EA]">
                                <Download className="mr-2 h-5 w-5" /> Download Report
                            </Button>
                            <Button onClick={() => alert("Consultation feature coming soon! You will be able to book a session with a certified Vaidya.")} className=" flex-1 h-14 w-full rounded-2xl bg-[#2F2F2F] font-semibold text-white hover:bg-[#1F1F1F]">
                                Consult Our Doctor
                            </Button>

                        </div>

                        {/* Awareness & Warning moved BELOW the buttons[cite: 1] */}
                        <div className="grid gap-4 mt-6 print:break-inside-avoid">
                            {report.awareness && (
                                <div className="flex items-start gap-4 rounded-3xl border border-[#B8D9C7] bg-[#E4F1EA] p-6">
                                    <Info className="mt-1 h-6 w-6 shrink-0 text-[#4A8B6A]" />
                                    <p className="text-sm leading-7 text-[#4A8B6A]"><span className="font-semibold">Ayurvedic Awareness: </span>{report.awareness}</p>
                                </div>
                            )}
                            {report.disclaimer && (
                                <div className="flex items-start gap-4 rounded-3xl border border-[#F4D39C] bg-[#FFF6E8] p-6">
                                    <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-[#C47830]" />
                                    <p className="text-sm leading-7 text-[#8A5B22]">{report.disclaimer}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <CompactFooter />
            <DetailDrawer
                open={detailsOpen}
                user={user}
                dbRecord={dbRecord}
                onClose={() => setDetailsOpen(false)}
                onImageClick={setSelectedImage}
            />

            {selectedImage && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#2F2F2F]/45 p-5 backdrop-blur-sm print:hidden">
                    <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-5 top-5 rounded-full bg-white p-3 text-[#2F2F2F] shadow-lg">
                        <X className="h-5 w-5" />
                    </button>
                    <div className="max-h-[86vh] max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white p-3 shadow-[0_24px_70px_rgba(47,47,47,0.25)]">
                        <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[80vh] w-full object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}

function getBalanceLabel(doshas) {
    const sorted = Object.entries(doshas || {})
        .map(([key, value]) => ({ key, value: Number(value || 0) }))
        .sort((a, b) => b.value - a.value);

    if (!sorted.length) return "Prakriti";
    if (sorted[1] && sorted[0].value - sorted[1].value <= 15) {
        return `${DOSHA_META[sorted[0].key]?.label || sorted[0].key}-${DOSHA_META[sorted[1].key]?.label || sorted[1].key}`;
    }
    return DOSHA_META[sorted[0].key]?.label || sorted[0].key;
}

function getDoshaRank(key, doshas) {
    const value = Number(doshas[key] || 0);

    // Mathematically accurate thresholds instead of just 1st/2nd/3rd rank
    if (value >= 40) return "Dominant";
    if (value >= 25) return "Moderate";
    return "Low";
}

function DoshaBar({ label, level, value = 0, color }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#2F2F2F]">{label}</span>
                <span className="text-xs text-[#6B6B6B]">{level} - {value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#EFE8DF]">
                <div className="h-full rounded-full" style={{ width: `${value || 0}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

function InsightRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#E4DCD2] pb-3 last:border-0 last:pb-0">
            <span>{label}</span>
            <span className="font-semibold text-[#2F2F2F]">{value}</span>
        </div>
    );
}

function ReportSection({ number, title, accent, children }) {
    return (
        <section className="av-card p-6 lg:p-8 print:break-inside-avoid">
            <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-semibold text-[#2F2F2F]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: accent }}>
                    {number}
                </span>
                {title}
            </h2>
            {children}
        </section>
    );
}

function RecommendationGroup({ title, color, items = [] }) {
    return (
        <div className="rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color }}>{title}</h3>
            <ul className="space-y-2 text-sm leading-7 text-[#6B6B6B]">
                {(items || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MiniInsight({ title, text }) {
    return (
        <div className="rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6B6B]">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-[#2F2F2F]">{text}</p>
        </div>
    );
}

function ReportList({ title, items = [] }) {
    if (!items || items.length === 0) return null;

    return (
        <div>
            {title && <h3 className="mb-3 font-display text-xl font-semibold text-[#2F2F2F]">{title}</h3>}
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-4 text-sm leading-7 text-[#6B6B6B]">
                        <span className="font-semibold text-[#2F2F2F]">{item.heading}: </span>
                        <span>{item.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DetailDrawer({ open, user, dbRecord, onClose, onImageClick }) {
    if (!open || !dbRecord) return null;

    const demographics = dbRecord.demographics || {};
    const clinical = dbRecord.clinical || {};
    const images = [
        { label: "Face Image", src: dbRecord.images?.faceUrl },
        { label: "Tongue Image", src: dbRecord.images?.tongueUrl },
    ].filter((item) => item.src);

    return (
        <div className="fixed inset-0 z-[75] bg-[#2F2F2F]/25 backdrop-blur-sm print:hidden">
            <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-[#E4DCD2] bg-[#F7F3EE] shadow-[0_0_60px_rgba(47,47,47,0.18)] animate-in slide-in-from-right-8 duration-300">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E4DCD2] bg-[#F7F3EE]/95 p-6 backdrop-blur">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B6B6B]">Your Information</p>
                        <h2 className="font-display mt-1 text-3xl font-semibold text-[#2F2F2F]">Assessment details</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full border border-[#E4DCD2] bg-white p-2 text-[#2F2F2F]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    <section className="av-card p-5">
                        <h3 className="mb-4 font-display text-xl font-semibold text-[#2F2F2F]">Basic Information</h3>
                        <div className="grid gap-3">
                            <DetailRow label="Name" value={dbRecord.patientName || user?.name || "Not provided"} />
                            <DetailRow label="Age" value={demographics.age ? `${demographics.age} years` : "Not provided"} />
                            <DetailRow label="Gender" value={demographics.gender || "Not provided"} />
                            <DetailRow label="City" value={demographics.city || "Not provided"} />
                            <DetailRow label="Pincode" value={demographics.pincode || "Not provided"} />
                        </div>
                    </section>

                    <section className="av-card p-5">
                        <h3 className="mb-4 font-display text-xl font-semibold text-[#2F2F2F]">Clinical Details</h3>
                        <div className="grid gap-3">
                            <DetailRow label="Symptoms" value={clinical.symptoms || "Not provided"} long />
                            <DetailRow label="Duration" value={clinical.duration ? `${clinical.duration} days` : "Not provided"} />
                            <DetailRow label="Medicine Taken" value={clinical.medicineTaken ? "Yes" : "No"} />
                            {clinical.medicineTaken && <DetailRow label="Medicine Details" value={clinical.medicineDetails || "Not provided"} long />}
                            <DetailRow label="Medical History" value={clinical.medicalHistory || "Not provided"} long />
                        </div>
                    </section>

                    <section className="av-card p-5">
                        <h3 className="mb-4 font-display text-xl font-semibold text-[#2F2F2F]">Images You Uploaded</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {images.map((image) => (
                                <button
                                    key={image.label}
                                    type="button"
                                    onClick={() => onImageClick({ src: image.src, alt: image.label })}
                                    className="group rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-3 text-left"
                                >
                                    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white">
                                        <img src={image.src} alt={image.label} className="h-full max-w-full object-contain" />
                                        <div className="absolute inset-0 hidden items-center justify-center bg-[#2F2F2F]/20 text-white group-hover:flex">
                                            <Maximize2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-[#2F2F2F]">{image.label}</span>
                                        <Eye className="h-4 w-4 text-[#6FAF8F]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    );
}

function DetailRow({ label, value, long = false }) {
    return (
        <div className={`gap-3 rounded-2xl bg-[#F7F3EE] p-3 text-sm ${long ? "block" : "flex items-start justify-between"}`}>
            <span className="font-semibold text-[#6B6B6B]">{label}</span>
            <span className={`${long ? "mt-2 block leading-7" : "text-right"} text-[#2F2F2F]`}>{value}</span>
        </div>
    );
}

function CompactFooter() {
    return (
        <footer className="mx-auto max-w-7xl px-5 py-4 sm:px-8 border-t border-[#E4DCD2] mt-8 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h3 className="font-display text-xl font-semibold text-[#2F2F2F]">
                        Ayu<span className="text-[#6FAF8F]">r</span>Vision
                    </h3>
                    <p className="text-[11px] text-[#8A8177] mt-1 font-medium uppercase tracking-wider">
                        Intelligence Powered by Tradition
                    </p>
                </div>

                <div className="flex gap-8 text-xs font-semibold text-[#6B6B6B]">
                    <Link href="/" className="hover:text-[#6FAF8F] transition-colors">Home</Link>
                    <Link href="/diagnosis" className="hover:text-[#6FAF8F] transition-colors">Analyze</Link>
                    <Link href="/history" className="hover:text-[#6FAF8F] transition-colors">History</Link>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-[#A39A91] uppercase tracking-[0.15em] font-medium">
                        © 2026 AyurVision • Wellness Guidance
                    </p>
                </div>
            </div>
        </footer>
    );
}