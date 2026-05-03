"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, LogIn, LogOut, Menu, X } from "lucide-react";

export function readStoredUser() {
    if (typeof window === "undefined") return null;

    const storedUser = window.localStorage.getItem("ayurUser");
    const token = window.localStorage.getItem("ayurToken");
    if (!storedUser || !token) return null;

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        console.error("Corrupted user data", error);
        window.localStorage.removeItem("ayurUser");
        window.localStorage.removeItem("ayurToken");
        return null;
    }
}

export function useAyurUser() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const storedUser = readStoredUser();
        setTimeout(() => {
            setUser(storedUser);
            setAuthReady(true);
        }, 0);
    }, []);

    return { user, setUser, authReady };
}

export function requireLogin(router, message = "Please log in first to continue.") {
    if (typeof window !== "undefined") {
        window.sessionStorage.setItem("ayurAuthNotice", message);
    }
    router.push("/auth");
}

export function getInitial(name = "") {
    const cleaned = String(name || "").trim();
    return cleaned ? cleaned.charAt(0).toUpperCase() : "A";
}

export function AyurNav({ user, onUserChange, active = "", className = "" }) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const navLinks = [
        { label: "Doshas", href: "/#doshas", key: "doshas" },
        { label: "How it works", href: "/#how", key: "how" },
    ];

    const handleResults = () => {
        setMenuOpen(false);
        if (user) router.push("/history");
        else requireLogin(router, "Please log in first to view your results.");
    };

    const completeLogout = () => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("ayurUser");
            window.localStorage.removeItem("ayurToken");
        }
        onUserChange?.(null);
        setConfirmOpen(false);
        setMenuOpen(false);
        router.push("/");
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 border-b border-[#E4DCD2] bg-[#F7F3EE]/85 backdrop-blur-xl print:hidden ${className}`}>
                <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
                    <Link href="/" className="font-display text-[22px] font-semibold text-[#2F2F2F]">
                        Ayu<span className="text-[#6FAF8F]">r</span>Vision
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.key}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${active === link.key ? "text-[#2F2F2F]" : "text-[#6B6B6B] hover:text-[#2F2F2F]"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={handleResults}
                            className={`text-sm font-medium transition-colors ${active === "results" ? "text-[#2F2F2F]" : "text-[#6B6B6B] hover:text-[#2F2F2F]"}`}
                        >
                            Results
                        </button>
                    </div>

                    <div className="hidden items-center md:flex">
                        {user ? (
                            <div className="group relative">
                                <button
                                    type="button"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6FAF8F] text-sm font-semibold text-white shadow-[0_4px_16px_rgba(111,175,143,0.28)] transition hover:bg-[#4A8B6A]"
                                    aria-label="Account menu"
                                >
                                    {getInitial(user.name)}
                                </button>
                                <div className="invisible absolute right-0 mt-3 w-36 rounded-2xl border border-[#E4DCD2] bg-white p-2 opacity-0 shadow-[0_14px_40px_rgba(47,47,47,0.12)] transition-all group-hover:visible group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmOpen(true)}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#9F4A38] transition hover:bg-[#FBE9D7]"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#6FAF8F] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(111,175,143,0.28)] transition hover:bg-[#4A8B6A]"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DCD2] bg-white text-[#2F2F2F] md:hidden"
                        aria-label="Toggle navigation"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="border-t border-[#E4DCD2] bg-[#F7F3EE] px-5 py-4 md:hidden">
                        <div className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <Link key={link.key} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-white">
                                    {link.label}
                                </Link>
                            ))}
                            <button type="button" onClick={handleResults} className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[#6B6B6B] hover:bg-white">
                                Results
                            </button>
                            {user ? (
                                <button type="button" onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#9F4A38] hover:bg-[#FBE9D7]">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            ) : (
                                <Link href="/auth" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-[#6FAF8F] px-3 py-2 text-sm font-semibold text-white">
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {confirmOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2F2F2F]/30 px-4 backdrop-blur-sm print:hidden">
                    <div className="w-full max-w-sm rounded-3xl border border-[#E4DCD2] bg-white p-6 shadow-[0_24px_70px_rgba(47,47,47,0.18)]">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4F1EA] text-[#4A8B6A]">
                                <Leaf className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-semibold text-[#2F2F2F]">Log out?</h2>
                                <p className="text-sm text-[#6B6B6B]">Your current session will be closed.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                className="rounded-2xl border border-[#E4DCD2] px-4 py-2 text-sm font-semibold text-[#2F2F2F] transition hover:bg-[#F7F3EE]"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={completeLogout}
                                className="rounded-2xl bg-[#6FAF8F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4A8B6A]"
                            >
                                Yes, logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function DoshaRadialChart({ doshas = { vata: 15, pitta: 30, kapha: 55 }, label = "Vata-Kapha", caption = "Prakriti" }) {
    const safe = {
        vata: Number(doshas.vata || 0),
        pitta: Number(doshas.pitta || 0),
        kapha: Number(doshas.kapha || 0),
    };

    return (
        <div className="relative mx-auto h-[200px] w-[200px]">
            <svg viewBox="0 0 200 200" className="h-[200px] w-[200px] -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#E4F1EA" strokeWidth="18" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#6FAF8F" strokeWidth="18" strokeDasharray={`${safe.kapha * 5.02} 502`} strokeLinecap="round" />
                <circle cx="100" cy="100" r="55" fill="none" stroke="#FBE9D7" strokeWidth="18" />
                <circle cx="100" cy="100" r="55" fill="none" stroke="#E6A15A" strokeWidth="18" strokeDasharray={`${safe.pitta * 3.46} 346`} strokeDashoffset="-30" strokeLinecap="round" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="#EDEAF7" strokeWidth="18" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="#C9C2E0" strokeWidth="18" strokeDasharray={`${safe.vata * 1.88} 188`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-[22px] font-semibold leading-tight text-[#2F2F2F]">{label}</span>
                <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#6B6B6B]">{caption}</span>
            </div>
        </div>
    );
}


export function HeroMandala({ className = "" }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Inline style for the custom slow rotation animation */}
            <style jsx>{`
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotateSlow 60s linear infinite;
        }
      `}</style>
            <svg
                className="animate-rotate-slow h-full w-full opacity-40 md:opacity-60"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="200" cy="200" r="192" stroke="#4A8B6A" strokeWidth="1.2" />
                <circle cx="200" cy="200" r="180" stroke="#2F2F2F" strokeWidth="1.6" />
                <circle cx="200" cy="200" r="162" stroke="#6FAF8F" strokeWidth="0.9" />
                <circle cx="200" cy="200" r="140" stroke="#2F2F2F" strokeWidth="1.6" />
                <circle cx="200" cy="200" r="122" stroke="#C9C2E0" strokeWidth="0.9" />
                <circle cx="200" cy="200" r="100" stroke="#2F2F2F" strokeWidth="1.6" />
                <circle cx="200" cy="200" r="82" stroke="#E6A15A" strokeWidth="0.9" />
                <circle cx="200" cy="200" r="60" stroke="#2F2F2F" strokeWidth="1.6" />
                <circle cx="200" cy="200" r="42" stroke="#6FAF8F" strokeWidth="0.9" />
                <circle cx="200" cy="200" r="20" stroke="#2F2F2F" strokeWidth="1.6" />
                <line x1="200" y1="8" x2="200" y2="392" stroke="#2F2F2F" strokeWidth="1" />
                <line x1="8" y1="200" x2="392" y2="200" stroke="#2F2F2F" strokeWidth="1" />
                <line x1="57" y1="57" x2="343" y2="343" stroke="#2F2F2F" strokeWidth="0.9" />
                <line x1="343" y1="57" x2="57" y2="343" stroke="#2F2F2F" strokeWidth="0.9" />
                <line x1="200" y1="8" x2="392" y2="200" stroke="#6FAF8F" strokeWidth="0.7" />
                <line x1="392" y1="200" x2="200" y2="392" stroke="#6FAF8F" strokeWidth="0.7" />
                <line x1="200" y1="392" x2="8" y2="200" stroke="#6FAF8F" strokeWidth="0.7" />
                <line x1="8" y1="200" x2="200" y2="8" stroke="#6FAF8F" strokeWidth="0.7" />
                <polygon points="200.0,45.0 238.2,147.4 347.4,152.1 261.8,220.1 291.1,325.4 200.0,265.0 108.9,325.4 138.2,220.1 52.6,152.1 161.8,147.4" stroke="#2F2F2F" strokeWidth="1.3" fill="none" />
                <ellipse cx="200" cy="155" rx="12" ry="22" stroke="#E6A15A" strokeWidth="1" fill="none" />
                <ellipse cx="200" cy="245" rx="12" ry="22" stroke="#E6A15A" strokeWidth="1" fill="none" />
                <ellipse cx="155" cy="200" rx="22" ry="12" stroke="#E6A15A" strokeWidth="1" fill="none" />
                <ellipse cx="245" cy="200" rx="22" ry="12" stroke="#E6A15A" strokeWidth="1" fill="none" />
                <circle cx="200" cy="60" r="3.5" fill="#6FAF8F" />
                <circle cx="340" cy="200" r="3.5" fill="#6FAF8F" />
                <circle cx="200" cy="340" r="3.5" fill="#6FAF8F" />
                <circle cx="60" cy="200" r="3.5" fill="#6FAF8F" />
                <circle cx="200" cy="200" r="6" fill="#E6A15A" />
            </svg>
        </div>
    );
}