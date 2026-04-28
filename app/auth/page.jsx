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
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     // Form State
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: ""
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.id]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setErrorMsg("");

//         try {
//             const res = await fetch("/api/auth", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     action: isLogin ? "login" : "signup",
//                     name: formData.name,
//                     email: formData.email,
//                     password: formData.password
//                 }),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 // ADD THIS LINE: Save user to local storage
//                 localStorage.setItem("ayurUser", JSON.stringify(data.user));
//                 router.push("/diagnosis");
//             } else {
//                 setErrorMsg(data.message);
//             }
//         } catch (err) {
//             setErrorMsg("Failed to connect to the server.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const res = await fetch("/api/auth/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 // --- THIS IS THE MAGIC THAT SURVIVES PAGE RELOADS ---
//                 // 1. Save the secure token
//                 window.localStorage.setItem("ayurToken", data.token);

//                 // 2. Save the user details so the Navbar can display their name instantly
//                 window.localStorage.setItem("ayurUser", JSON.stringify(data.user));

//                 // 3. Redirect to the diagnosis page
//                 router.push("/diagnosis");
//             } else {
//                 alert(data.message);
//             }
//         } catch (error) {
//             alert("Something went wrong. Please try again.");
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
//                         <form onSubmit={handleLogin} className="space-y-4">

//                             {/* Show error messages if they fail to login/signup */}
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
//                                     setErrorMsg(""); // Clear errors when switching modes
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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Leaf } from "lucide-react";
import Link from "next/link";

export default function AyurVisionAuth() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Unified Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Unified Submit Function
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            // FIX: Point this directly to the unified route we created!
            const apiRoute = "/api/auth";

            const res = await fetch(apiRoute, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: isLogin ? "login" : "signup", // Make sure this line is here!
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (data.success) {
                // 1. Save the secure token
                window.localStorage.setItem("ayurToken", data.token);

                // 2. Save the user details
                window.localStorage.setItem("ayurUser", JSON.stringify(data.user));

                // 3. Redirect to the diagnosis page
                router.push("/diagnosis");
            } else {
                setErrorMsg(data.message);
            }
        } catch (error) {
            setErrorMsg("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-green-200">
            <div className="w-full max-w-md space-y-6">

                {/* Brand Header */}
                <div className="text-center flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AyurVision</h1>
                </div>

                <Card className="border-t-4 border-t-green-600 shadow-xl bg-white">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {isLogin ? "Welcome Back" : "Create an Account"}
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            {isLogin ? "Sign in to access your Ayurvedic reports" : "Start your personalized wellness journey"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* CHANGED: Now uses the unified handleAuthSubmit function */}
                        <form onSubmit={handleAuthSubmit} className="space-y-4">

                            {errorMsg && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center font-medium border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                                    <Input id="name" placeholder="e.g. Rahul Sharma" required={!isLogin} value={formData.name} onChange={handleChange} className="focus-visible:ring-green-600" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                                <Input id="email" type="email" placeholder="patient@example.com" required value={formData.email} onChange={handleChange} className="focus-visible:ring-green-600" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                                    {isLogin && <Link href="#" className="text-xs text-green-600 hover:text-green-700 hover:underline">Forgot password?</Link>}
                                </div>
                                <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="focus-visible:ring-green-600" />
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-6 shadow-md transition-all" disabled={loading}>
                                {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50 rounded-b-xl">
                        <div className="text-sm text-center text-slate-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrorMsg("");
                                }}
                                className="text-green-600 font-semibold hover:underline"
                            >
                                {isLogin ? "Sign up free" : "Log in here"}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-md border border-slate-200">
                            <ShieldCheck className="w-4 h-4 text-green-600" /> Privacy Protected & Encrypted
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}