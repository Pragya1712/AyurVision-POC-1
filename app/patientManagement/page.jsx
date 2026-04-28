"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function PatientManagement() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        fetch("/api/patients")
            .then(res => res.json())
            .then(data => setPatients(data.patients || []));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <div className="w-64 bg-white border-r p-6 hidden md:block">
                <h2 className="text-xl font-bold text-teal-900 mb-8">DermaDX Doctor</h2>
                <ul className="space-y-4 text-slate-600 font-medium">
                    <li className="text-teal-600">Patient Management</li>
                    <li>Analytics</li>
                    <li>Settings</li>
                </ul>
            </div>

            <div className="flex-1 p-8">
                <div className="max-w-4xl space-y-6">
                    <h1 className="text-3xl font-bold text-slate-900">Patient Registry</h1>
                    <div className="space-y-4">
                        {patients.map((p) => (
                            <Link href={`/results/${p._id}`} key={p._id}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-teal-800 text-lg">{p.patientId}</h3>
                                            <p className="text-sm text-slate-500">
                                                {p.patientDetails.age} years • {p.patientDetails.gender}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-1">
                                                Completed
                                            </span>
                                            <p className="text-xs text-slate-500">Dosha: {p.diagnosis?.dominantDosha}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}