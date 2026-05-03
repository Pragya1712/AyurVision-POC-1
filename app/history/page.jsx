
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Download, Eye, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { AyurNav } from "@/components/ui/ayur-ui";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export default function MyReports() {
    const router = useRouter();
    const [user, setUser] = useState({ name: "Loading...", id: "" });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

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

            const fetchReports = async () => {
                try {
                    const res = await fetch("/api/reports", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await res.json();

                    if (data.success) {
                        const sortedData = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        const formattedReports = sortedData.map((r) => ({
                            _id: r._id,
                            reportId: r.finalReport?.reportId || r._id.substring(0, 8).toUpperCase(),
                            date: new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                            doshas: r.finalReport?.doshas || { vata: 0, pitta: 0, kapha: 0 },
                            age: r.demographics?.age,
                            gender: r.demographics?.gender,
                            symptoms: r.clinical?.symptoms,
                            fullData: r,
                        }));

                        setReports(formattedReports);
                    } else {
                        console.error(data.message);
                    }
                } catch (error) {
                    console.error("Failed to load reports", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchReports();
        } catch (e) {
            console.error(e);
            window.localStorage.removeItem("ayurUser");
            window.localStorage.removeItem("ayurToken");
            router.push("/auth");
        }
    }, [router]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this report? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setReports((prev) => prev.filter((report) => report._id !== id));
            } else {
                alert("Failed to delete report.");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting report.");
        }
    };

    const handleDownloadPDF = (reportItem) => {
        const dbRecord = reportItem.fullData;
        const report = dbRecord.finalReport;

        if (!report) {
            alert("Analysis is incomplete for this record.");
            return;
        }

        const doc = new jsPDF();
        let y = 20;
        const margin = 20;
        const maxLineWidth = doc.internal.pageSize.getWidth() - margin * 2;

        const addWrappedText = (text, isBold = false, fontSize = 12) => {
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxLineWidth);
            if (y + lines.length * 7 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(lines, margin, y);
            y += lines.length * 7 + 5;
        };

        addWrappedText("AyurVision - Ayurvedic Insights Report", true, 18);
        y += 5;
        addWrappedText(`Report ID: ${report.reportId || dbRecord._id}`, false, 10);
        addWrappedText(`Date: ${new Date(dbRecord.createdAt).toLocaleDateString()}`, false, 10);
        addWrappedText(`Patient: ${dbRecord.demographics.age} years | ${dbRecord.demographics.gender} | ${dbRecord.demographics.city}`, false, 10);
        y += 10;

        addWrappedText("1. Dosha Imbalance", true, 14);
        addWrappedText(`Vata: ${report.doshas.vata}% | Pitta: ${report.doshas.pitta}% | Kapha: ${report.doshas.kapha}%`);
        y += 5;

        addWrappedText("2. Ayurvedic Conditions", true, 14);
        report.diagnoses?.forEach((cond) => {
            addWrappedText(`${cond.condition} (Confidence: ${cond.confidence}%)`, true, 12);
            addWrappedText(cond.description);
        });

        doc.save(`Ayurvedic_Report_${report.reportId || "Patient"}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
            <AyurNav user={user} onUserChange={setUser} active="results" />

            <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8">
                <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#E4DCD2] pb-8 md:flex-row md:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Saved Results</p>
                        <h1 className="font-display text-4xl font-semibold text-[#2F2F2F]">My Ayurvedic Reports</h1>
                        <p className="mt-3 max-w-2xl text-base leading-8 text-[#6B6B6B]">
                            Review your past assessments, compare dosha patterns, and download your reports.
                        </p>
                    </div>
                    <Link href="/diagnosis">
                        <Button className="h-12 rounded-2xl bg-[#6FAF8F] px-5 font-semibold text-white shadow-[0_8px_24px_rgba(111,175,143,0.28)] hover:bg-[#4A8B6A]">
                            <PlusCircle className="mr-2 h-5 w-5" /> New Analysis
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid min-h-[360px] place-items-center rounded-3xl border border-[#E4DCD2] bg-white">
                        <div className="flex items-center gap-3 text-[#4A8B6A]">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-semibold">Loading your history...</span>
                        </div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#E4DCD2] bg-white px-6 py-20 text-center">
                        <Activity className="mx-auto mb-4 h-14 w-14 text-[#CFC6BB]" />
                        <h2 className="font-display text-2xl font-semibold text-[#2F2F2F]">No reports found</h2>
                        <p className="mt-2 text-[#6B6B6B]">Start your first Prakriti analysis to see it here.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {reports.map((report) => (
                            <article key={report._id} className="av-card grid gap-6 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(47,47,47,0.09)] lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-[#E4F1EA] px-3 py-1 text-xs font-bold text-[#4A8B6A]">{report.reportId}</span>
                                        <span className="text-sm font-medium text-[#6B6B6B]">{report.date}</span>
                                    </div>
                                    <div>
                                        <h2 className="font-display text-2xl font-semibold text-[#2F2F2F]">Prakriti Report</h2>
                                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#6B6B6B]">
                                            <span className="rounded-xl border border-[#E4DCD2] bg-[#F7F3EE] px-3 py-1">Age {report.age}</span>
                                            <span className="rounded-xl border border-[#E4DCD2] bg-[#F7F3EE] px-3 py-1">{report.gender}</span>
                                            <span className="max-w-[260px] truncate rounded-xl border border-[#E4DCD2] bg-[#F7F3EE] px-3 py-1">{report.symptoms}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <HistoryDosha label="Vata" value={report.doshas.vata} color="#C9C2E0" />
                                    <HistoryDosha label="Pitta" value={report.doshas.pitta} color="#E6A15A" />
                                    <HistoryDosha label="Kapha" value={report.doshas.kapha} color="#6FAF8F" />
                                </div>

                                <div className="flex flex-wrap justify-end gap-3">
                                    <Link href={`/results/${report._id}`}>
                                        <Button variant="outline" className="rounded-2xl border-[#E4DCD2] bg-white text-[#2F2F2F] hover:bg-[#F7F3EE]">
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Button>
                                    </Link>
                                    <Button onClick={() => handleDownloadPDF(report)} variant="outline" className="rounded-2xl border-[#B8D9C7] bg-white text-[#4A8B6A] hover:bg-[#E4F1EA]">
                                        <Download className="mr-2 h-4 w-4" /> PDF
                                    </Button>
                                    <Button onClick={() => handleDelete(report._id)} variant="ghost" className="rounded-2xl px-3 text-[#9F4A38] hover:bg-[#FFF1EE] hover:text-[#9F4A38]">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
            <CompactFooter />
        </div>
    );
}

function HistoryDosha({ label, value = 0, color }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#EFE8DF]">
                <div className="h-full rounded-full" style={{ width: `${value || 0}%`, backgroundColor: color }} />
            </div>
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