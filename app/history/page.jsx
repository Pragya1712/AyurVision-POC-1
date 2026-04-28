"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Leaf, PlusCircle, Download, Eye, Trash2, Activity } from "lucide-react";
import { jsPDF } from "jspdf";

export default function MyReports() {
    const router = useRouter();
    const [user, setUser] = useState({ name: "Loading...", id: "" });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // 1. Get logged-in user AND their secure token
        const storedUser = window.localStorage.getItem("ayurUser");
        const token = window.localStorage.getItem("ayurToken");

        if (!storedUser || !token) {
            router.push("/auth");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            // FIX 1: Wrap in setTimeout to satisfy the strict linter!
            setTimeout(() => {
                setUser(parsedUser);
            }, 0);

            // 2. Fetch reports securely
            const fetchReports = async () => {
                try {
                    // FIX 2: Add the Authorization header so the backend lets us in!
                    // Note: We don't even need ?userId= anymore because the backend securely reads it from the token!
                    const res = await fetch(`/api/reports`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    const data = await res.json();

                    if (data.success) {
                        // Sort by newest first, then map
                        const sortedData = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                        const formattedReports = sortedData.map(r => ({
                            _id: r._id,
                            reportId: r.finalReport?.reportId || r._id.substring(0, 8).toUpperCase(),
                            date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                            doshas: r.finalReport?.doshas || { vata: 0, pitta: 0, kapha: 0 },
                            age: r.demographics?.age,
                            gender: r.demographics?.gender,
                            symptoms: r.clinical?.symptoms,
                            fullData: r // Keep the full object for PDF generation
                        }));

                        setReports(formattedReports);
                    } else {
                        console.error(data.message); // If token fails, log it
                    }
                } catch (error) {
                    console.error("Failed to load reports", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchReports();

        } catch (e) {
            // If data is corrupted, wipe it and log them out
            window.localStorage.removeItem("ayurUser");
            window.localStorage.removeItem("ayurToken");
            router.push("/auth");
        }
    }, [router]);

    const handleLogout = () => {
        if (typeof window !== "undefined") window.localStorage.removeItem("ayurUser");
        router.push("/auth");
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this report? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setReports(prev => prev.filter(report => report._id !== id));
            } else {
                alert("Failed to delete report.");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting report.");
        }
    };

    // --- PDF GENERATOR (Reused from Results Page) ---
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
            if (y + (lines.length * 7) > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(lines, margin, y);
            y += (lines.length * 7) + 5;
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
        report.diagnoses.forEach(cond => {
            addWrappedText(`${cond.condition} (Confidence: ${cond.confidence}%)`, true, 12);
            addWrappedText(cond.description);
        });

        doc.save(`Ayurvedic_Report_${report.reportId || 'Patient'}.pdf`);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-green-700 font-medium animate-pulse">Loading your history...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Navbar */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center"><Leaf className="w-5 h-5 text-green-600" /></div>
                    <span className="font-bold text-slate-900 text-xl tracking-tight">AyurVision</span>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium relative">
                    <span className="text-green-600 border-b-2 border-green-600 pb-1">My Reports</span>
                    <div className="group relative">
                        <div className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm cursor-pointer">{user.name}</div>
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium rounded-md">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Ayurvedic Reports</h1>
                        <p className="text-slate-500 mt-1">Review your past skin analyses and downloaded reports</p>
                    </div>
                    <Link href="/diagnosis">
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md h-12 text-base font-semibold">
                            <PlusCircle className="w-5 h-5 mr-2" /> New Analysis
                        </Button>
                    </Link>
                </div>

                {reports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No reports found</h3>
                        <p className="text-slate-500 mt-2">Start your first Prakriti analysis to see it here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {reports.map((report) => (
                            <div key={report._id} className="flex flex-col lg:flex-row items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all gap-6 group">

                                {/* Left: Meta Info */}
                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">{report.reportId}</span>
                                        <span className="text-sm text-slate-500 font-medium">{report.date}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-sm text-slate-600 font-medium pt-1">
                                        <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">Age {report.age}</span>
                                        <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">{report.gender}</span>
                                        <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-md truncate max-w-[200px]">{report.symptoms}</span>
                                    </div>
                                </div>

                                {/* Middle: Dosha Numbers */}
                                <div className="flex items-center gap-6 px-6 lg:px-10 lg:border-x border-slate-200 w-full lg:w-auto justify-center py-4 lg:py-0">
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-purple-700 uppercase mb-1">Vata</div>
                                        <div className="text-xl font-black text-slate-800">{report.doshas.vata}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-red-600 uppercase mb-1">Pitta</div>
                                        <div className="text-xl font-black text-slate-800">{report.doshas.pitta}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-green-700 uppercase mb-1">Kapha</div>
                                        <div className="text-xl font-black text-slate-800">{report.doshas.kapha}%</div>
                                    </div>
                                </div>

                                {/* Right: Action Buttons */}
                                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                                    <Link href={`/results/${report._id}`}>
                                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                    </Link>
                                    <Button onClick={() => handleDownloadPDF(report)} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                                        <Download className="w-4 h-4 mr-2" /> PDF
                                    </Button>
                                    <Button onClick={() => handleDelete(report._id)} variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 px-3">
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}