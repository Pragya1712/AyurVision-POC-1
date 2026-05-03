// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { ShieldCheck, Leaf } from "lucide-react";
// // import Link from "next/link";

// // export default function AyurVisionAuth() {
// //     const router = useRouter();
// //     const [isLogin, setIsLogin] = useState(true);
// //     const [loading, setLoading] = useState(false);
// //     const [errorMsg, setErrorMsg] = useState("");
// //     const [email, setEmail] = useState("");
// //     const [password, setPassword] = useState("");
// //     const [loading, setLoading] = useState(false);
// //     // Form State
// //     const [formData, setFormData] = useState({
// //         name: "",
// //         email: "",
// //         password: ""
// //     });

// //     const handleChange = (e) => {
// //         setFormData({ ...formData, [e.target.id]: e.target.value });
// //     };

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setErrorMsg("");

// //         try {
// //             const res = await fetch("/api/auth", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify({
// //                     action: isLogin ? "login" : "signup",
// //                     name: formData.name,
// //                     email: formData.email,
// //                     password: formData.password
// //                 }),
// //             });

// //             const data = await res.json();

// //             if (data.success) {
// //                 // ADD THIS LINE: Save user to local storage
// //                 localStorage.setItem("ayurUser", JSON.stringify(data.user));
// //                 router.push("/diagnosis");
// //             } else {
// //                 setErrorMsg(data.message);
// //             }
// //         } catch (err) {
// //             setErrorMsg("Failed to connect to the server.");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const handleLogin = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);

// //         try {
// //             const res = await fetch("/api/auth/login", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify({ email, password }),
// //             });

// //             const data = await res.json();

// //             if (data.success) {
// //                 // --- THIS IS THE MAGIC THAT SURVIVES PAGE RELOADS ---
// //                 // 1. Save the secure token
// //                 window.localStorage.setItem("ayurToken", data.token);

// //                 // 2. Save the user details so the Navbar can display their name instantly
// //                 window.localStorage.setItem("ayurUser", JSON.stringify(data.user));

// //                 // 3. Redirect to the diagnosis page
// //                 router.push("/diagnosis");
// //             } else {
// //                 alert(data.message);
// //             }
// //         } catch (error) {
// //             alert("Something went wrong. Please try again.");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-green-200">
// //             <div className="w-full max-w-md space-y-6">

// //                 {/* Brand Header */}
// //                 <div className="text-center flex flex-col items-center justify-center space-y-2">
// //                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm">
// //                         <Leaf className="w-6 h-6" />
// //                     </div>
// //                     <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AyurVision</h1>
// //                 </div>

// //                 <Card className="border-t-4 border-t-green-600 shadow-xl bg-white">
// //                     <CardHeader className="space-y-1 text-center">
// //                         <CardTitle className="text-2xl font-bold text-slate-900">
// //                             {isLogin ? "Welcome Back" : "Create an Account"}
// //                         </CardTitle>
// //                         <CardDescription className="text-slate-500">
// //                             {isLogin ? "Sign in to access your Ayurvedic reports" : "Start your personalized wellness journey"}
// //                         </CardDescription>
// //                     </CardHeader>

// //                     <CardContent>
// //                         <form onSubmit={handleLogin} className="space-y-4">

// //                             {/* Show error messages if they fail to login/signup */}
// //                             {errorMsg && (
// //                                 <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center font-medium border border-red-100">
// //                                     {errorMsg}
// //                                 </div>
// //                             )}

// //                             {!isLogin && (
// //                                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
// //                                     <Label htmlFor="name" className="text-slate-700">Full Name</Label>
// //                                     <Input id="name" placeholder="e.g. Rahul Sharma" required={!isLogin} value={formData.name} onChange={handleChange} className="focus-visible:ring-green-600" />
// //                                 </div>
// //                             )}

// //                             <div className="space-y-2">
// //                                 <Label htmlFor="email" className="text-slate-700">Email Address</Label>
// //                                 <Input id="email" type="email" placeholder="patient@example.com" required value={formData.email} onChange={handleChange} className="focus-visible:ring-green-600" />
// //                             </div>
// //                             <div className="space-y-2">
// //                                 <div className="flex items-center justify-between">
// //                                     <Label htmlFor="password" className="text-slate-700">Password</Label>
// //                                     {isLogin && <Link href="#" className="text-xs text-green-600 hover:text-green-700 hover:underline">Forgot password?</Link>}
// //                                 </div>
// //                                 <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="focus-visible:ring-green-600" />
// //                             </div>

// //                             <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-6 shadow-md transition-all" disabled={loading}>
// //                                 {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
// //                             </Button>
// //                         </form>
// //                     </CardContent>
// //                     <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50 rounded-b-xl">
// //                         <div className="text-sm text-center text-slate-500">
// //                             {isLogin ? "Don't have an account? " : "Already have an account? "}
// //                             <button
// //                                 onClick={() => {
// //                                     setIsLogin(!isLogin);
// //                                     setErrorMsg(""); // Clear errors when switching modes
// //                                 }}
// //                                 className="text-green-600 font-semibold hover:underline"
// //                             >
// //                                 {isLogin ? "Sign up free" : "Log in here"}
// //                             </button>
// //                         </div>

// //                         <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-md border border-slate-200">
// //                             <ShieldCheck className="w-4 h-4 text-green-600" /> Privacy Protected & Encrypted
// //                         </div>
// //                     </CardFooter>
// //                 </Card>
// //             </div>
// //         </div>
// //     );
// // }

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { ShieldCheck, Leaf } from "lucide-react";
// import Link from "next/link";

// export default function AyurVisionAuth() {
//     const router = useRouter();
//     const [isLogin, setIsLogin] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState("");

//     // Unified Form State
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: ""
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.id]: e.target.value });
//     };

//     // Unified Submit Function
//     const handleAuthSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrorMsg("");

//         try {
//             // FIX: Point this directly to the unified route we created!
//             const apiRoute = "/api/auth";

//             const res = await fetch(apiRoute, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     action: isLogin ? "login" : "signup", // Make sure this line is here!
//                     name: formData.name,
//                     email: formData.email,
//                     password: formData.password
//                 }),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 // 1. Save the secure token
//                 window.localStorage.setItem("ayurToken", data.token);

//                 // 2. Save the user details
//                 window.localStorage.setItem("ayurUser", JSON.stringify(data.user));

//                 // 3. Redirect to the diagnosis page
//                 router.push("/diagnosis");
//             } else {
//                 setErrorMsg(data.message);
//             }
//         } catch (error) {
//             setErrorMsg("Something went wrong. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-green-200">
//             <div className="w-full max-w-md space-y-6">

//                 {/* Brand Header */}
//                 <div className="text-center flex flex-col items-center justify-center space-y-2">
//                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm">
//                         <Leaf className="w-6 h-6" />
//                     </div>
//                     <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AyurVision</h1>
//                 </div>

//                 <Card className="border-t-4 border-t-green-600 shadow-xl bg-white">
//                     <CardHeader className="space-y-1 text-center">
//                         <CardTitle className="text-2xl font-bold text-slate-900">
//                             {isLogin ? "Welcome Back" : "Create an Account"}
//                         </CardTitle>
//                         <CardDescription className="text-slate-500">
//                             {isLogin ? "Sign in to access your Ayurvedic reports" : "Start your personalized wellness journey"}
//                         </CardDescription>
//                     </CardHeader>

//                     <CardContent>
//                         {/* CHANGED: Now uses the unified handleAuthSubmit function */}
//                         <form onSubmit={handleAuthSubmit} className="space-y-4">

//                             {errorMsg && (
//                                 <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center font-medium border border-red-100">
//                                     {errorMsg}
//                                 </div>
//                             )}

//                             {!isLogin && (
//                                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
//                                     <Label htmlFor="name" className="text-slate-700">Full Name</Label>
//                                     <Input id="name" placeholder="e.g. Rahul Sharma" required={!isLogin} value={formData.name} onChange={handleChange} className="focus-visible:ring-green-600" />
//                                 </div>
//                             )}

//                             <div className="space-y-2">
//                                 <Label htmlFor="email" className="text-slate-700">Email Address</Label>
//                                 <Input id="email" type="email" placeholder="patient@example.com" required value={formData.email} onChange={handleChange} className="focus-visible:ring-green-600" />
//                             </div>
//                             <div className="space-y-2">
//                                 <div className="flex items-center justify-between">
//                                     <Label htmlFor="password" className="text-slate-700">Password</Label>
//                                     {isLogin && <Link href="#" className="text-xs text-green-600 hover:text-green-700 hover:underline">Forgot password?</Link>}
//                                 </div>
//                                 <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="focus-visible:ring-green-600" />
//                             </div>

//                             <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-6 shadow-md transition-all" disabled={loading}>
//                                 {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
//                             </Button>
//                         </form>
//                     </CardContent>
//                     <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50 rounded-b-xl">
//                         <div className="text-sm text-center text-slate-500">
//                             {isLogin ? "Don't have an account? " : "Already have an account? "}
//                             <button
//                                 onClick={() => {
//                                     setIsLogin(!isLogin);
//                                     setErrorMsg("");
//                                 }}
//                                 className="text-green-600 font-semibold hover:underline"
//                             >
//                                 {isLogin ? "Sign up free" : "Log in here"}
//                             </button>
//                         </div>

//                         <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-md border border-slate-200">
//                             <ShieldCheck className="w-4 h-4 text-green-600" /> Privacy Protected & Encrypted
//                         </div>
//                     </CardFooter>
//                 </Card>
//             </div>
//         </div>
//     );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { AyurNav, useAyurUser } from "@/components/ui/ayur-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AyurVisionAuth() {
    const router = useRouter();
    const { user, setUser } = useAyurUser();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [notice, setNotice] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedNotice = window.sessionStorage.getItem("ayurAuthNotice");
        if (storedNotice) {
            setTimeout(() => setNotice(storedNotice), 0);
            window.sessionStorage.removeItem("ayurAuthNotice");
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setNotice("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: isLogin ? "login" : "signup",
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (data.success) {
                window.localStorage.setItem("ayurToken", data.token);
                window.localStorage.setItem("ayurUser", JSON.stringify(data.user));
                setUser(data.user);
                router.push("/diagnosis");
            } else {
                setErrorMsg(data.message);
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F3EE] text-[#2F2F2F]">
            <AyurNav user={user} onUserChange={setUser} />

            <main className="grid min-h-screen place-items-center px-5 pb-16 pt-28 sm:px-8">
                <div className="w-full max-w-5xl">
                    <div className="grid overflow-hidden rounded-[28px] border border-[#E4DCD2] bg-white shadow-[0_18px_60px_rgba(47,47,47,0.10)] lg:grid-cols-[0.92fr_1fr]">
                        <section className="bg-[#EFE8DF] p-8 sm:p-10">
                            <div className="flex h-full flex-col justify-between gap-12">
                                <div>
                                    <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F1EA] text-[#4A8B6A]">
                                        <Leaf className="h-6 w-6" />
                                    </div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Secure access</p>
                                    <h1 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F]">
                                        Continue your AyurVision assessment
                                    </h1>
                                    <p className="mt-5 text-base leading-8 text-[#6B6B6B]">
                                        Log in or create an account to begin assessments, save reports, and review your results later.
                                    </p>
                                </div>

                                {/* <div className="grid gap-4">
                                    {[
                                        { icon: ShieldCheck, title: "Private by design", text: "Your reports stay connected to your account." },
                                        { icon: Leaf, title: "Consistent journey", text: "Start assessment, generate questions, and return to results anytime." },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.title} className="rounded-2xl border border-[#E4DCD2] bg-white/70 p-4">
                                                <div className="flex items-start gap-3">
                                                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#6FAF8F]" />
                                                    <div>
                                                        <h2 className="text-sm font-semibold text-[#2F2F2F]">{item.title}</h2>
                                                        <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">{item.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div> */}
                            </div>
                        </section>

                        <section className="p-8 sm:p-10">
                            <div className="mx-auto max-w-md">
                                <div className="mb-8">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">
                                        {isLogin ? "Welcome back" : "Create account"}
                                    </p>
                                    <h2 className="font-display text-3xl font-semibold text-[#2F2F2F]">
                                        {isLogin ? "Login to continue" : "Start your account"}
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
                                        {isLogin ? "Use your account to open assessments and saved reports." : "Register once, then continue directly to your assessment."}
                                    </p>
                                </div>

                                {notice && (
                                    <div className="mb-5 rounded-2xl border border-[#B8D9C7] bg-[#E4F1EA] p-4 text-sm font-medium text-[#4A8B6A]">
                                        {notice}
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="mb-5 rounded-2xl border border-[#F3C0B5] bg-[#FFF1EE] p-4 text-sm font-medium text-[#9F4A38]">
                                        {errorMsg}
                                    </div>
                                )}

                                <form onSubmit={handleAuthSubmit} className="space-y-5">
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[#2F2F2F]">Full Name</Label>
                                            <div className="relative">
                                                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Ram Kumar"
                                                    required={!isLogin}
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="h-12 rounded-2xl border-[#E4DCD2] bg-[#F7F3EE] pl-10 focus-visible:ring-[#6FAF8F]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[#2F2F2F]">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="patient@example.com"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="h-12 rounded-2xl border-[#E4DCD2] bg-[#F7F3EE] pl-10 focus-visible:ring-[#6FAF8F]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[#2F2F2F]">Password</Label>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="h-12 rounded-2xl border-[#E4DCD2] bg-[#F7F3EE] pl-10 focus-visible:ring-[#6FAF8F]"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 w-full rounded-2xl bg-[#6FAF8F] font-semibold text-white shadow-[0_8px_24px_rgba(111,175,143,0.28)] hover:bg-[#4A8B6A]"
                                        disabled={loading}
                                    >
                                        {loading ? "Authenticating..." : isLogin ? "Login" : "Create Account"}
                                    </Button>
                                </form>

                                <div className="mt-7 rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-4 text-center text-sm text-[#6B6B6B]">
                                    {isLogin ? "Do not have an account? " : "Already have an account? "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setErrorMsg("");
                                            setNotice("");
                                        }}
                                        className="font-semibold text-[#4A8B6A] hover:underline"
                                    >
                                        {isLogin ? "Register here" : "Login here"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
