// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import Link from "next/link";

// export default function PatientManagement() {
//     const [patients, setPatients] = useState([]);

//     useEffect(() => {
//         fetch("/api/patients")
//             .then(res => res.json())
//             .then(data => setPatients(data.patients || []));
//     }, []);

//     return (
//         <div className="min-h-screen bg-slate-50 flex">
//             <div className="w-64 bg-white border-r p-6 hidden md:block">
//                 <h2 className="text-xl font-bold text-teal-900 mb-8">AyurVision Doctor</h2>
//                 <ul className="space-y-4 text-slate-600 font-medium">
//                     <li className="text-teal-600">Patient Management</li>
//                     <li>Analytics</li>
//                     <li>Settings</li>
//                 </ul>
//             </div>

//             <div className="flex-1 p-8">
//                 <div className="max-w-4xl space-y-6">
//                     <h1 className="text-3xl font-bold text-slate-900">Patient Registry</h1>
//                     <div className="space-y-4">
//                         {patients.map((p) => (
//                             <Link href={`/results/${p._id}`} key={p._id}>
//                                 <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
//                                     <CardContent className="p-4 flex justify-between items-center">
//                                         <div>
//                                             <h3 className="font-bold text-teal-800 text-lg">{p.patientId}</h3>
//                                             <p className="text-sm text-slate-500">
//                                                 {p.patientDetails.age} years • {p.patientDetails.gender}
//                                             </p>
//                                         </div>
//                                         <div className="text-right">
//                                             <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-1">
//                                                 Completed
//                                             </span>
//                                             <p className="text-xs text-slate-500">Dosha: {p.diagnosis?.dominantDosha}</p>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </Link>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, FileText, Leaf } from "lucide-react";
import { AyurNav, useAyurUser } from "@/components/ui/ayur-ui";

export default function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const { user, setUser } = useAyurUser();

    useEffect(() => {
        fetch("/api/patients")
            .then((res) => res.json())
            .then((data) => setPatients(data.patients || []))
            .catch((error) => console.error("Failed to load patients", error));
    }, []);

    return (
        <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
            <AyurNav user={user} onUserChange={setUser} />

            <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8">
                <div className="mb-10 border-b border-[#E4DCD2] pb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Doctor View</p>
                    <h1 className="font-display text-4xl font-semibold text-[#2F2F2F]">Patient Registry</h1>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-[#6B6B6B]">
                        Review completed patient assessments and open their AyurVision reports.
                    </p>
                </div>

                {patients.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#E4DCD2] bg-white px-6 py-20 text-center">
                        <Activity className="mx-auto mb-4 h-14 w-14 text-[#CFC6BB]" />
                        <h2 className="font-display text-2xl font-semibold text-[#2F2F2F]">No patients found</h2>
                        <p className="mt-2 text-[#6B6B6B]">Completed assessments will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {patients.map((patient) => (
                            <Link href={`/results/${patient._id}`} key={patient._id} className="av-card block p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(47,47,47,0.09)]">
                                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EA] text-[#4A8B6A]">
                                            <Leaf className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-display text-2xl font-semibold text-[#2F2F2F]">{patient.patientId || patient._id}</h2>
                                            <p className="mt-1 text-sm text-[#6B6B6B]">
                                                {patient.patientDetails?.age || "Age not set"} years - {patient.patientDetails?.gender || "Gender not set"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-[#E4F1EA] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#4A8B6A]">Completed</span>
                                        <FileText className="h-5 w-5 text-[#6FAF8F]" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
