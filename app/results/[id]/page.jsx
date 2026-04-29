"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Download, Plus, AlertTriangle, Activity, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export default function ReportResult({ params }) {
    const router = useRouter();
    const [user, setUser] = useState({ name: "Loading...", id: "" });
    const [report, setReport] = useState(null);
    const [dbRecord, setDbRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");

    const unwrappedParams = use(params);

    // 1. AUTHENTICATION EFFECT
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = window.localStorage.getItem("ayurUser");
            if (!storedUser) {
                router.push("/auth");
                return;
            }

            try {
                // Wrap in setTimeout to make it async and satisfy the strict linter
                setTimeout(() => {
                    setUser(JSON.parse(storedUser));
                }, 0);
            } catch (e) {
                // If the JSON is corrupted, clear it and force login
                console.error("Corrupted user data");
                window.localStorage.removeItem("ayurUser");
                router.push("/auth");
            }
        }
    }, [router, setUser]);

    // 2. DATA FETCHING EFFECT
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/reports/${unwrappedParams.id}`);
                if (!res.ok) throw new Error("Failed to fetch report");

                const data = await res.json();
                if (res.status === 503 || data.errorType === "AI_OVERLOADED") {
                    setAiOverloadError(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the error
                    return;
                }
                if (data.success && data.data && data.data.finalReport) {
                    setDbRecord(data.data);
                    setReport(data.data.finalReport);
                } else {
                    setApiError("Report generation is still pending or failed.");
                }
            } catch (error) {
                console.error("Fetch error:", error); // <-- Actually using the variable fixes the yellow line
                setApiError("Connection error while fetching the report.");
            } finally {
                setLoading(false);
            }
        };

        // Only run if we actually have the ID
        if (unwrappedParams?.id) {
            fetchReport();
        }
    }, [unwrappedParams.id]);
    // --- GENERATE NATIVE PDF LOGIC ---
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
            const lines = doc.splitTextToSize(text, maxLineWidth);

            if (y + (lines.length * 7) > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }

            doc.text(lines, margin, y);
            y += (lines.length * 7) + 5;
        };

        // Build PDF Content
        addWrappedText("AyurVision - Ayurvedic Insights Report", true, 18);
        y += 5;
        addWrappedText(`Patient ID: ${report.reportId || dbRecord._id}`, false, 10);
        addWrappedText(`Date: ${new Date(dbRecord.createdAt).toLocaleDateString()}`, false, 10);
        addWrappedText(`Patient: ${dbRecord.demographics.age} years | ${dbRecord.demographics.gender} | ${dbRecord.demographics.city}`, false, 10);
        y += 5;

        addWrappedText("1. Overview", true, 14);
        addWrappedText(report.summary.overview);
        y += 5;

        if (report.tongue_analysis && report.tongue_analysis.provided) {
            addWrappedText("Tongue Insights (Jihva Pariksha)", true, 14);
            report.tongue_analysis.observations.forEach(obs => addWrappedText(`- ${obs}`, false, 12));
            addWrappedText(`Agni (Digestion): ${report.tongue_analysis.agni_state}`);
            addWrappedText(`Ama (Toxins): ${report.tongue_analysis.ama_state}`);
            y += 5;
        }

        addWrappedText("2. Dosha Imbalance", true, 14);
        addWrappedText(`Vata: ${report.doshas.vata}% | Pitta: ${report.doshas.pitta}% | Kapha: ${report.doshas.kapha}%`);
        if (report.imbalance_explanation) {
            y += 2; // small gap
            addWrappedText(`Analysis: ${report.imbalance_explanation}`, false, 11);
        }
        y += 5;

        addWrappedText("3. Ayurvedic Conditions", true, 14);
        report.diagnoses.forEach(cond => {
            addWrappedText(`${cond.condition} (Confidence: ${cond.confidence}%)`, true, 12);
            addWrappedText(cond.description);
        });
        y += 5;

        addWrappedText("4. Daily Routine & Lifestyle", true, 14);
        report.daily_routine.forEach(item => {
            addWrappedText(`${item.heading}:`, true, 12);
            addWrappedText(item.detail);
        });
        y += 5;

        addWrappedText("5. Recommended Herbs", true, 14);
        report.herbs.forEach(item => {
            addWrappedText(`${item.heading}:`, true, 12);
            addWrappedText(item.detail);
        });
        y += 5;

        addWrappedText("6. Usage & Application", true, 14);
        report.herb_usage?.forEach(item => {
            addWrappedText(`${item.heading}:`, true, 12);
            addWrappedText(item.detail);
        });

        doc.save(`Ayurvedic_Report_${report.reportId || 'Patient'}.pdf`);
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") window.localStorage.removeItem("ayurUser");
        router.push("/auth");
    };
    // --- HELPER LOGIC FOR DOSHA METER ---
    const getDoshaLevel = (value) => {
        if (value <= 35) return { text: "Normal", color: "text-green-600 bg-green-50 px-2 py-0.5 rounded" };
        if (value <= 50) return { text: "Mildly Elevated", color: "text-amber-600 bg-amber-50 px-2 py-0.5 rounded" };
        return { text: "Highly Imbalanced", color: "text-red-600 bg-red-50 px-2 py-0.5 rounded" };
    };

    const doshaInfo = {
        vata: "Vata (Air & Space): Governs movement and nervous system. Imbalance causes dryness, anxiety, or irregular digestion.",
        pitta: "Pitta (Fire & Water): Governs metabolism. Imbalance causes heat, inflammation, redness, or acidity.",
        kapha: "Kapha (Earth & Water): Governs structure & immunity. Imbalance causes oiliness, congestion, or weight gain."
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-green-700 font-medium animate-pulse">Loading Ayurvedic Insights...</div>;
    if (apiError) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 font-bold">{apiError}</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 print:bg-white print:pb-0">

            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center"><Leaf className="w-5 h-5 text-green-600" /></div>
                    <span className="font-bold text-slate-900 text-xl tracking-tight">AyurVision</span>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium relative">
                    <Link href="/history" className="text-green-600 border-b-2 border-green-600 pb-1">My Reports</Link>
                    <div className="group relative">
                        <div className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm cursor-pointer">{user.name}</div>
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium rounded-md">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-8 print:pt-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-green-900 flex items-center gap-2"><Leaf className="w-8 h-8 text-green-600" /> Ayurvedic Insights</h1>
                        <p className="text-slate-500 font-medium mt-1">Report ID: {report.reportId} | Date: {new Date(dbRecord.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <Button onClick={handleDownloadPDF} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 font-semibold h-11">
                            <Download className="w-4 h-4 mr-2" /> Download PDF Report
                        </Button>
                        <Link href="/diagnosis">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold h-11"><Plus className="w-4 h-4 mr-2" /> New Analysis</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-green-50/50 rounded-2xl border border-green-100 p-6 shadow-sm">
                            <h2 className="font-bold text-lg text-slate-800 mb-4 border-b border-green-200 pb-2">Patient Information</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Age</span><span className="font-semibold">{dbRecord.demographics.age} years</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Gender</span><span className="font-semibold">{dbRecord.demographics.gender}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Duration</span><span className="font-semibold">{dbRecord.clinical.duration} days</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Location</span><span className="font-semibold text-right max-w-[150px]">{dbRecord.demographics.city}</span></div>
                            </div>
                        </div>

                        <div className="bg-green-50/50 rounded-2xl border border-green-100 p-6 shadow-sm">
                            <h2 className="font-bold text-lg text-slate-800 mb-4 border-b border-green-200 pb-2">Uploaded Images</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Face</span>
                                    <div className="w-full bg-white rounded-xl p-2 border border-slate-200 shadow-sm flex items-center justify-center min-h-[200px]">
                                        <img src={dbRecord.images.faceUrl} alt="Face" className="max-w-full max-h-[250px] object-contain rounded-lg" />
                                    </div>
                                </div>

                                {dbRecord.images.tongueUrl && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block mt-4">Tongue</span>
                                        <div className="w-full bg-white rounded-xl p-2 border border-slate-200 shadow-sm flex items-center justify-center min-h-[200px]">
                                            <img src={dbRecord.images.tongueUrl} alt="Tongue" className="max-w-full max-h-[250px] object-contain rounded-lg" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-green-50/50 rounded-2xl border border-green-100 p-6 shadow-sm print:break-inside-avoid">
                            <h2 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-green-600" /> Dosha Meter</h2>
                            <div className="space-y-6">
                                {/* VATA */}
                                <div>
                                    <div className="flex justify-between items-center text-sm mb-1.5">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span className="text-purple-700">Vata</span>
                                            <div className="group relative flex items-center">
                                                <Info className="w-4 h-4 text-slate-400 cursor-help hover:text-purple-600 transition-colors" />
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-white text-xs font-normal rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                                    {doshaInfo.vata}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${getDoshaLevel(report.doshas.vata).color}`}>{getDoshaLevel(report.doshas.vata).text}</span>
                                            <span className="text-slate-700 font-bold">{report.doshas.vata || 0}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${report.doshas.vata || 0}%` }}></div></div>
                                </div>

                                {/* PITTA */}
                                <div>
                                    <div className="flex justify-between items-center text-sm mb-1.5">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span className="text-red-600">Pitta</span>
                                            <div className="group relative flex items-center">
                                                <Info className="w-4 h-4 text-slate-400 cursor-help hover:text-red-600 transition-colors" />
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-white text-xs font-normal rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                                    {doshaInfo.pitta}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${getDoshaLevel(report.doshas.pitta).color}`}>{getDoshaLevel(report.doshas.pitta).text}</span>
                                            <span className="text-slate-700 font-bold">{report.doshas.pitta || 0}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${report.doshas.pitta || 0}%` }}></div></div>
                                </div>

                                {/* KAPHA */}
                                <div>
                                    <div className="flex justify-between items-center text-sm mb-1.5">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span className="text-green-700">Kapha</span>
                                            <div className="group relative flex items-center">
                                                <Info className="w-4 h-4 text-slate-400 cursor-help hover:text-green-600 transition-colors" />
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-800 text-white text-xs font-normal rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                                    {doshaInfo.kapha}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${getDoshaLevel(report.doshas.kapha).color}`}>{getDoshaLevel(report.doshas.kapha).text}</span>
                                            <span className="text-slate-700 font-bold">{report.doshas.kapha || 0}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${report.doshas.kapha || 0}%` }}></div></div>
                                </div>
                            </div>

                            {/* NEW: AI Explanation Box */}
                            {report.imbalance_explanation && (
                                <div className="mt-6 p-4 bg-white rounded-xl border border-green-100 text-sm text-slate-700 leading-relaxed shadow-sm">
                                    <strong className="text-green-900 block mb-1">Analysis Rationale:</strong>
                                    {report.imbalance_explanation}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-2">

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                            <h2 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2"><span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span> Overview</h2>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{report.summary?.overview}</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                            <h2 className="font-bold text-xl text-slate-800 mb-6 border-b pb-4">Ayurvedic Conditions</h2>
                            <div className="space-y-6">
                                {report.diagnoses?.map((cond, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-green-800 text-lg">{cond.condition}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${idx === 0 ? 'bg-green-500' : 'bg-amber-500'}`}>{cond.confidence}%</span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{cond.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm print:break-inside-avoid">
                            <h2 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span> Lifestyle & Routines</h2>
                            <div className="space-y-3">
                                {report.daily_routine?.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700 text-sm leading-relaxed">
                                        <strong className="text-blue-900">{item.heading}:</strong> {item.detail}
                                    </div>
                                ))}
                                {report.yoga_asanas?.map((item, idx) => (
                                    <div key={`y-${idx}`} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-slate-700 text-sm leading-relaxed">
                                        <strong className="text-purple-900">{item.heading}:</strong> {item.detail}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* TONGUE ANALYSIS BLOCK */}
                        {report.tongue_analysis && report.tongue_analysis.provided && (
                            <div className="bg-pink-50/50 rounded-2xl border border-pink-100 p-6 lg:p-8 shadow-sm">
                                <h2 className="font-bold text-xl text-pink-900 mb-4 flex items-center gap-2">
                                    <span className="bg-pink-200 text-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-sm">👅</span> Jihva Pariksha (Tongue Insights)
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-pink-800 text-sm uppercase tracking-wide">Visual Observations</h4>
                                        <ul className="list-disc list-inside text-slate-700 text-sm mt-1">
                                            {report.tongue_analysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                        </ul>
                                    </div>

                                    {/* NEW: Dosha Correlation */}
                                    <div className="bg-white p-4 rounded-xl border border-pink-100 mt-2">
                                        <h4 className="font-bold text-pink-800 text-sm mb-1">Skin & Gut Correlation</h4>
                                        <p className="text-sm text-slate-700 font-medium">{report.tongue_analysis.dosha_correlation}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div className="bg-white p-4 rounded-xl border border-pink-100">
                                            <h4 className="font-bold text-pink-800 text-sm mb-1">State of Agni (Digestion)</h4>
                                            <p className="text-sm text-slate-600">{report.tongue_analysis.agni_state}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-pink-100">
                                            <h4 className="font-bold text-pink-800 text-sm mb-1">State of Ama (Toxins)</h4>
                                            <p className="text-sm text-slate-600">{report.tongue_analysis.ama_state}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm print:break-inside-avoid">
                            <h2 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2"><span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span> Safe Herbs & Lepas</h2>
                            <div className="space-y-3">
                                {report.herbs?.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-200 text-slate-700 text-sm leading-relaxed">
                                        <strong className="text-green-900">{item.heading}:</strong> {item.detail}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm print:break-inside-avoid">
                            <h2 className="font-bold text-xl text-orange-900 mb-4 flex items-center gap-2"><span className="bg-orange-100 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span> Usage & Application</h2>
                            <div className="space-y-3">
                                {report.herb_usage?.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 text-slate-700 text-sm leading-relaxed">
                                        <strong className="text-orange-900">{item.heading}:</strong> {item.detail}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 print:break-inside-avoid">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-200 flex items-start gap-4">
                                <Info className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                <div className="text-sm text-green-900 leading-relaxed"><span className="font-bold">Ayurvedic Awareness: </span>{report.awareness}</div>
                            </div>
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-center gap-4">
                                <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <p className="text-sm text-amber-900 font-medium">{report.disclaimer}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-slate-200 print:hidden">
                            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 h-14 border-green-600 text-green-700 hover:bg-green-50 font-bold text-lg">
                                <Download className="w-5 h-5 mr-2" /> Download Report
                            </Button>
                            <Button onClick={() => alert("Consultation feature coming soon! You will be able to book a session with a certified Vaidya.")} className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl">
                                Consult Our Doctor
                            </Button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}