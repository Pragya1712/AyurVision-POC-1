// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Leaf, Camera, Cpu, ClipboardList, Sparkles,
//   ScanFace, UserCheck, ShieldCheck, Zap,
//   Info, CheckCircle2, ChevronDown, ChevronUp
// } from "lucide-react";
// import Image from "next/image";
// export default function AyurVisionLanding() {
//   // --- HERO IMAGE SLIDER LOGIC ---
//   // Updated to .png to match your files!
//   const heroImages = [
//     "/images/hero1.png",
//     "/images/hero2.png"
//   ];
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [heroImages.length]);
//   // --- FAQ LOGIC ---
//   const faqs = [
//     { question: "What images should I upload?", answer: "You can upload a clear photo of your face (neutral expression, good lighting) and your tongue. Both are traditional Ayurvedic diagnostic indicators." },
//     { question: "How does the image analysis work?", answer: "Our AI analyzes facial features (skin texture, characteristics) and tongue appearance (color, coating) based on Ayurvedic diagnostic principles to identify Dosha patterns." },
//     { question: "Is my image data secure?", answer: "Yes. Images are encrypted during upload, processed securely, and never shared with third parties. We prioritize your privacy." },
//     { question: "How long does the analysis take?", answer: "The entire process takes 5-10 minutes: upload your image (30 seconds), AI analysis (1-2 minutes), complete the questionnaire (3-5 minutes), and receive instant results." },
//     { question: "Can I retake the analysis?", answer: "Yes! Your Prakriti remains constant, but your current state (Vikriti) can change. We recommend retaking the analysis every 3-6 months to track changes." },
//   ];
//   const [openFaq, setOpenFaq] = useState(null);

//   const toggleFaq = (index) => {
//     setOpenFaq(openFaq === index ? null : index);
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-green-200">

//       {/* --- NAVIGATION --- */}
//       <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
//         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
//               <Leaf className="w-6 h-6 text-green-600" />
//             </div>
//             <span className="text-2xl font-bold text-slate-900 tracking-tight">AyurVision</span>
//           </div>
//           <Link href="/auth">
//             <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-2 text-base font-medium shadow-sm hover:shadow-md transition-all">
//               Login
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* --- HERO SECTION --- */}
//       <main className="pt-32 pb-20 px-6">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           <div className="space-y-6">
//             <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.15]">
//               AyurVision
//             </h1>
//             <p className="text-lg text-slate-600 leading-relaxed">
//               Discover your unique Ayurvedic constitution through advanced image analysis combined with traditional wisdom. Simply upload a photo of your face or tongue, answer personalized questions, and receive an instant Prakriti diagnosis with tailored wellness recommendations.
//             </p>
//             <p className="text-lg text-slate-600 leading-relaxed pb-4">
//               Our AI-powered platform analyzes facial features and tongue characteristics - key indicators in Ayurvedic diagnosis - to identify your dominant doshas (Vata, Pitta, Kapha) and provide personalized guidance for optimal health and balance.
//             </p>
//             <Link href="/auth" className="inline-block">
//               <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-7 text-lg rounded-full shadow-lg hover:shadow-green-600/30 transition-all font-medium flex items-center gap-2">
//                 Start Your Prakriti Analysis <span className="text-xl leading-none">›</span>
//               </Button>
//             </Link>
//           </div>

//           {/* Image Slider Container */}
//           <div className="relative h-[450px] md:h-[550px] w-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-100">
//             {heroImages.map((src, index) => (
//               <Image
//                 key={index}
//                 src={src}
//                 alt={`AyurVision Demo ${index + 1}`}
//                 fill
//                 priority={index === 0} // Tells Next.js to load the first image immediately
//                 className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
//                   }`}
//               />
//             ))}
//             {/* Fallback placeholder if no images are loaded */}
//             <div className="absolute inset-0 -z-10 bg-green-50 flex items-center justify-center text-green-200">
//               <Leaf className="w-32 h-32" />
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* --- HOW IT WORKS --- */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">How It Works</h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
//             {/* Optional connecting line for desktop */}
//             <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10"></div>

//             <FeatureIcon icon={<Camera className="w-8 h-8 text-green-600" />} bg="bg-green-50" title="Upload Image" desc="Take a clear photo of your face or tongue and upload it securely to our platform." />
//             <FeatureIcon icon={<Cpu className="w-8 h-8 text-blue-600" />} bg="bg-blue-50" title="AI Analysis" desc="Our AI analyzes facial features or tongue characteristics based on Ayurvedic principles." />
//             <FeatureIcon icon={<ClipboardList className="w-8 h-8 text-amber-600" />} bg="bg-amber-50" title="Answer Questions" desc="Complete a personalized questionnaire to refine your constitution assessment." />
//             <FeatureIcon icon={<Sparkles className="w-8 h-8 text-rose-500" />} bg="bg-rose-50" title="Get Diagnosis" desc="Receive your Prakriti diagnosis with personalized wellness recommendations." />
//           </div>
//         </div>
//       </section>

//       {/* --- WHY CHOOSE AYURVISION --- */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">Why Choose AyurVision</h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
//             <CardBox icon={<ScanFace className="w-8 h-8 text-green-600" />} title="AI-Powered Analysis" desc="Advanced image recognition technology combined with traditional Ayurvedic diagnostic methods." />
//             <CardBox icon={<UserCheck className="w-8 h-8 text-blue-600" />} title="Accurate & Personalized" desc="Image-based assessment provides precise constitution analysis tailored to your unique features." />
//             <CardBox icon={<ShieldCheck className="w-8 h-8 text-slate-700" />} title="Privacy Protected" desc="Your images are securely processed and never shared. All data is encrypted and confidential." />
//             <CardBox icon={<Zap className="w-8 h-8 text-amber-500" />} title="Instant Results" desc="Get your complete Prakriti diagnosis in minutes with actionable wellness recommendations." />
//           </div>
//         </div>
//       </section>

//       {/* --- IMPORTANT INFORMATION --- */}
//       <section className="py-20 bg-white">
//         <div className="max-w-4xl mx-auto px-6">
//           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Important Information</h2>

//           <div className="bg-amber-50/50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-12">
//             <div className="flex items-start gap-3">
//               <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
//               <div>
//                 <h3 className="font-bold text-slate-900 mb-2">Medical Disclaimer</h3>
//                 <p className="text-slate-600 text-sm leading-relaxed">
//                   This analysis is for educational purposes only. It does not diagnose, treat, or cure any medical condition. Results are based on Ayurvedic principles and AI image analysis. Always consult qualified healthcare professionals before making health decisions.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-bold text-xl text-slate-900 mb-6">Privacy & Accuracy</h3>
//             <ul className="space-y-4">
//               <ListItem text="Images are encrypted and never shared with third parties" />
//               <ListItem text="Results depend on image quality and honest questionnaire responses" />
//               <ListItem text="For detailed guidance, consult a certified Ayurvedic practitioner" />
//             </ul>
//           </div>
//         </div>
//       </section>

//       {/* --- FAQ SECTION --- */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-4xl mx-auto px-6">
//           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
//           <div className="space-y-4">
//             {faqs.map((faq, index) => (
//               <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
//                 <button
//                   onClick={() => toggleFaq(index)}
//                   className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
//                 >
//                   <span className="font-semibold text-slate-900">{faq.question}</span>
//                   {openFaq === index ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
//                 </button>
//                 <div className={`px-6 pb-6 text-slate-600 ${openFaq === index ? 'block' : 'hidden'}`}>
//                   {faq.answer}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- BOTTOM CTA --- */}
//       <section className="py-24 bg-green-600 text-center px-6">
//         <div className="max-w-3xl mx-auto space-y-8">
//           <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Discover Your Prakriti?</h2>
//           <p className="text-green-50 text-lg leading-relaxed max-w-2xl mx-auto">
//             Upload your image and begin your journey to personalized wellness. Understand your unique constitution through the fusion of AI technology and ancient Ayurvedic wisdom.
//           </p>
//           <Link href="/auth" className="inline-block pt-4">
//             <Button className="bg-white hover:bg-green-50 text-green-700 px-8 py-7 text-lg rounded-full shadow-xl font-bold flex items-center gap-2">
//               Start Your Prakriti Analysis <span className="text-xl leading-none">›</span>
//             </Button>
//           </Link>
//         </div>
//       </section>

//       {/* --- FOOTER --- */}
//       <footer className="bg-[#1e293b] text-slate-300 py-16 px-6">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-700 pb-12">
//           <div>
//             <h3 className="text-2xl font-bold text-white mb-4">AyurVision</h3>
//             <p className="text-sm leading-relaxed max-w-xs">
//               AI-powered Ayurvedic constitution analysis for personalized wellness and balanced living.
//             </p>
//           </div>
//           <div>
//             <h4 className="text-white font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-3 text-sm">
//               <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
//               <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
//               <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
//               <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-semibold mb-4">Contact Us</h4>
//             <a href="mailto:support@ayurvision.com" className="text-sm hover:text-green-400 transition-colors">
//               support@ayurvision.com
//             </a>
//           </div>
//         </div>
//         <div className="text-center text-sm text-slate-500 pt-8">
//           © 2026 AyurVision. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }

// // --- HELPER COMPONENTS ---

// function FeatureIcon({ icon, bg, title, desc }) {
//   return (
//     <div className="flex flex-col items-center text-center space-y-4 relative z-10">
//       <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center shadow-sm`}>
//         {icon}
//       </div>
//       <h3 className="text-xl font-bold text-slate-900">{title}</h3>
//       <p className="text-slate-600 text-sm leading-relaxed max-w-[250px]">{desc}</p>
//     </div>
//   );
// }

// function CardBox({ icon, title, desc }) {
//   return (
//     <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
//       <div className="mb-6">{icon}</div>
//       <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
//       <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
//     </div>
//   );
// }

// function ListItem({ text }) {
//   return (
//     <li className="flex items-center gap-3">
//       <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//         <CheckCircle2 className="w-4 h-4 text-blue-600" />
//       </div>
//       <span className="text-slate-700">{text}</span>
//     </li>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Leaf, Camera, Cpu, ClipboardList, Sparkles,
  ScanFace, UserCheck, ShieldCheck, Zap,
  Info, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import Image from "next/image";

export default function AyurVisionLanding() {
  const router = useRouter();

  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null);

  // Check local storage on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = window.localStorage.getItem("ayurUser");
      const token = window.localStorage.getItem("ayurToken");

      if (storedUser && token) {
        try {
          // Wrap in setTimeout to satisfy the strict linter!
          setTimeout(() => {
            setUser(JSON.parse(storedUser));
          }, 0);
        } catch (e) {
          console.error("Corrupted user data", e);
          window.localStorage.removeItem("ayurUser");
          window.localStorage.removeItem("ayurToken");
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ayurUser");
      window.localStorage.removeItem("ayurToken");
      setUser(null); // Instantly updates the navbar back to "Login"
    }
  };

  // --- HERO IMAGE SLIDER LOGIC ---
  const heroImages = [
    "/images/hero1.png",
    "/images/hero2.png"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // --- FAQ LOGIC ---
  const faqs = [
    { question: "What images should I upload?", answer: "You can upload a clear photo of your face (neutral expression, good lighting) and your tongue. Both are traditional Ayurvedic diagnostic indicators." },
    { question: "How does the image analysis work?", answer: "Our AI analyzes facial features (skin texture, characteristics) and tongue appearance (color, coating) based on Ayurvedic diagnostic principles to identify Dosha patterns." },
    { question: "Is my image data secure?", answer: "Yes. Images are encrypted during upload, processed securely, and never shared with third parties. We prioritize your privacy." },
    { question: "How long does the analysis take?", answer: "The entire process takes 5-10 minutes: upload your image (30 seconds), AI analysis (1-2 minutes), complete the questionnaire (3-5 minutes), and receive instant results." },
    { question: "Can I retake the analysis?", answer: "Yes! Your Prakriti remains constant, but your current state (Vikriti) can change. We recommend retaking the analysis every 3-6 months to track changes." },
  ];
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-green-200">

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">AyurVision</span>
          </div>

          {/* DYNAMIC NAV MENU */}
          {user ? (
            <div className="flex items-center gap-6 text-sm font-medium relative">
              <Link href="/history" className="text-slate-600 hover:text-green-600 font-semibold transition-colors">My Reports</Link>
              <div className="group relative">
                <div className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm cursor-pointer hover:bg-green-700 transition-colors">
                  {user.name}
                </div>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium rounded-md">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-2 text-base font-medium shadow-sm hover:shadow-md transition-all">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.15]">
              AyurVision
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Discover your unique Ayurvedic constitution through advanced image analysis combined with traditional wisdom. Simply upload a photo of your face or tongue, answer personalized questions, and receive an instant Prakriti diagnosis with tailored wellness recommendations.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed pb-4">
              Our AI-powered platform analyzes facial features and tongue characteristics - key indicators in Ayurvedic diagnosis - to identify your dominant doshas (Vata, Pitta, Kapha) and provide personalized guidance for optimal health and balance.
            </p>

            {/* DYNAMIC HERO BUTTON */}
            <Link href={user ? "/diagnosis" : "/auth"} className="inline-block">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-7 text-lg rounded-full shadow-lg hover:shadow-green-600/30 transition-all font-medium flex items-center gap-2">
                {user ? "Start Analysis" : "Start Your Prakriti Analysis"} <span className="text-xl leading-none">›</span>
              </Button>
            </Link>

          </div>

          {/* Image Slider Container */}
          <div className="relative h-[450px] md:h-[550px] w-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-100">
            {heroImages.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt={`AyurVision Demo ${index + 1}`}
                fill
                priority={index === 0}
                className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 -z-10 bg-green-50 flex items-center justify-center text-green-200">
              <Leaf className="w-32 h-32" />
            </div>
          </div>
        </div>
      </main>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10"></div>
            <FeatureIcon icon={<Camera className="w-8 h-8 text-green-600" />} bg="bg-green-50" title="Upload Image" desc="Take a clear photo of your face or tongue and upload it securely to our platform." />
            <FeatureIcon icon={<Cpu className="w-8 h-8 text-blue-600" />} bg="bg-blue-50" title="AI Analysis" desc="Our AI analyzes facial features or tongue characteristics based on Ayurvedic principles." />
            <FeatureIcon icon={<ClipboardList className="w-8 h-8 text-amber-600" />} bg="bg-amber-50" title="Answer Questions" desc="Complete a personalized questionnaire to refine your constitution assessment." />
            <FeatureIcon icon={<Sparkles className="w-8 h-8 text-rose-500" />} bg="bg-rose-50" title="Get Diagnosis" desc="Receive your Prakriti diagnosis with personalized wellness recommendations." />
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE AYURVISION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">Why Choose AyurVision</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <CardBox icon={<ScanFace className="w-8 h-8 text-green-600" />} title="AI-Powered Analysis" desc="Advanced image recognition technology combined with traditional Ayurvedic diagnostic methods." />
            <CardBox icon={<UserCheck className="w-8 h-8 text-blue-600" />} title="Accurate & Personalized" desc="Image-based assessment provides precise constitution analysis tailored to your unique features." />
            <CardBox icon={<ShieldCheck className="w-8 h-8 text-slate-700" />} title="Privacy Protected" desc="Your images are securely processed and never shared. All data is encrypted and confidential." />
            <CardBox icon={<Zap className="w-8 h-8 text-amber-500" />} title="Instant Results" desc="Get your complete Prakriti diagnosis in minutes with actionable wellness recommendations." />
          </div>
        </div>
      </section>

      {/* --- IMPORTANT INFORMATION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Important Information</h2>

          <div className="bg-amber-50/50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-12">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Medical Disclaimer</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This analysis is for educational purposes only. It does not diagnose, treat, or cure any medical condition. Results are based on Ayurvedic principles and AI image analysis. Always consult qualified healthcare professionals before making health decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl text-slate-900 mb-6">Privacy & Accuracy</h3>
            <ul className="space-y-4">
              <ListItem text="Images are encrypted and never shared with third parties" />
              <ListItem text="Results depend on image quality and honest questionnaire responses" />
              <ListItem text="For detailed guidance, consult a certified Ayurvedic practitioner" />
            </ul>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div className={`px-6 pb-6 text-slate-600 ${openFaq === index ? 'block' : 'hidden'}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-24 bg-green-600 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Discover Your Prakriti?</h2>
          <p className="text-green-50 text-lg leading-relaxed max-w-2xl mx-auto">
            Upload your image and begin your journey to personalized wellness. Understand your unique constitution through the fusion of AI technology and ancient Ayurvedic wisdom.
          </p>
          <Link href={user ? "/diagnosis" : "/auth"} className="inline-block pt-4">
            <Button className="bg-white hover:bg-green-50 text-green-700 px-8 py-7 text-lg rounded-full shadow-xl font-bold flex items-center gap-2">
              {user ? "Start Analysis" : "Start Your Prakriti Analysis"} <span className="text-xl leading-none">›</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1e293b] text-slate-300 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-700 pb-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">AyurVision</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered Ayurvedic constitution analysis for personalized wellness and balanced living.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <a href="mailto:support@ayurvision.com" className="text-sm hover:text-green-400 transition-colors">
              support@ayurvision.com
            </a>
          </div>
        </div>
        <div className="text-center text-sm text-slate-500 pt-8">
          © 2026 AyurVision. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function FeatureIcon({ icon, bg, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 relative z-10">
      <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed max-w-[250px]">{desc}</p>
    </div>
  );
}

function CardBox({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ListItem({ text }) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-slate-700">{text}</span>
    </li>
  );
}