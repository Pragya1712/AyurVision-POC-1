// "use client";

// import { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Leaf, UploadCloud, X, EyeOff, Eye, CheckCircle2, AlertTriangle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// export default function DiagnosisPage() {
//     const router = useRouter();

//     // User & Image States
//     const [user, setUser] = useState({ name: "Loading...", id: "" });
//     const [originalFaceImage, setOriginalFaceImage] = useState(null);
//     const [faceImage, setFaceImage] = useState(null);
//     const [tongueImage, setTongueImage] = useState(null);
//     const [aiOverloadError, setAiOverloadError] = useState(false);
//     // Blur Logic States
//     const [isBlurred, setIsBlurred] = useState(false);
//     const [isDetecting, setIsDetecting] = useState(false);
//     const [faceApiLoaded, setFaceApiLoaded] = useState(false);

//     // Form, Error & Assessment States
//     const [loading, setLoading] = useState(false);
//     const [apiError, setApiError] = useState("");
//     const [errors, setErrors] = useState({});
//     const [generatedQuestions, setGeneratedQuestions] = useState(null);
//     const [recordId, setRecordId] = useState(null);

//     // NEW: State to track which options the user clicks
//     const [answers, setAnswers] = useState({});

//     const formRef = useRef(null);

//     const [formData, setFormData] = useState({
//         age: "", gender: "Female", city: "", pincode: "",
//         symptoms: "", duration: "",
//         medicineTaken: "no", medicineDetails: "", medicalHistory: ""
//     });

//     useEffect(() => {
//         // 1. Authentication Check
//         if (typeof window !== "undefined") {
//             const storedUser = window.localStorage.getItem("ayurUser");
//             if (storedUser) {
//                 try {
//                     // Wrap in setTimeout to satisfy the strict linter
//                     setTimeout(() => {
//                         setUser(JSON.parse(storedUser));
//                     }, 0);
//                 } catch (e) {
//                     console.error("Corrupted user data", e);
//                     window.localStorage.removeItem("ayurUser");
//                     router.push("/auth");
//                 }
//             } else {
//                 router.push("/auth");
//             }
//         }

//         const loadModels = async () => {
//             try {
//                 const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
//                 await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//                 await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//                 setFaceApiLoaded(true);
//             } catch (error) { console.error('Error loading face-api models:', error); }
//         };

//         if (typeof window !== 'undefined') {
//             if (!window.faceapi) {
//                 const script = document.createElement('script');
//                 script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js';
//                 script.async = true;
//                 script.onload = loadModels;
//                 document.body.appendChild(script);
//             } else loadModels();
//         }
//     }, [router]);

//     const handleLogout = () => {
//         if (typeof window !== "undefined") window.localStorage.removeItem("ayurUser");
//         router.push("/auth");
//     };

//     const clearError = (field) => {
//         if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
//     };

//     const handleImageUpload = (e, type) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (type === 'face') {
//                     setOriginalFaceImage(reader.result);
//                     setFaceImage(reader.result);
//                     setIsBlurred(false);
//                     clearError('faceImage');
//                     setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
//                 }
//                 if (type === 'tongue') {
//                     setTongueImage(reader.result);
//                     // NEW: Scroll down when tongue image is uploaded too!
//                     setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
//                 }
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const toggleBlurEyes = async () => {
//         if (isBlurred) {
//             setFaceImage(originalFaceImage);
//             setIsBlurred(false);
//             return;
//         }
//         if (!faceApiLoaded || isDetecting || !originalFaceImage) return;
//         setIsDetecting(true);

//         try {
//             const img = new Image();
//             img.crossOrigin = "anonymous";
//             img.src = originalFaceImage;
//             await new Promise(resolve => img.onload = resolve);

//             const detections = await window.faceapi.detectAllFaces(img, new window.faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
//             if (detections.length === 0) {
//                 alert("No faces detected by AI. Ensure the image is clear.");
//                 setIsDetecting(false);
//                 return;
//             }

//             const canvas = document.createElement('canvas');
//             canvas.width = img.width;
//             canvas.height = img.height;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(img, 0, 0);

//             detections.forEach(det => {
//                 const lm = det.landmarks;
//                 const allEyePoints = [...lm.getLeftEye(), ...lm.getRightEye()];
//                 const minX = Math.min(...allEyePoints.map(p => p.x));
//                 const maxX = Math.max(...allEyePoints.map(p => p.x));
//                 const minY = Math.min(...allEyePoints.map(p => p.y));
//                 const maxY = Math.max(...allEyePoints.map(p => p.y));

//                 const width = maxX - minX;
//                 const height = maxY - minY;
//                 const paddingX = width * 0.25;
//                 const paddingY = height * 1.5;

//                 const startX = Math.max(0, minX - paddingX);
//                 const startY = Math.max(0, minY - paddingY);
//                 const boxW = Math.min(canvas.width - startX, width + (paddingX * 2));
//                 const boxH = Math.min(canvas.height - startY, height + (paddingY * 2));

//                 const tempCanvas = document.createElement('canvas');
//                 tempCanvas.width = canvas.width;
//                 tempCanvas.height = canvas.height;
//                 const tempCtx = tempCanvas.getContext('2d');
//                 tempCtx.filter = 'blur(25px)';
//                 tempCtx.drawImage(img, 0, 0);

//                 ctx.drawImage(tempCanvas, startX, startY, boxW, boxH, startX, startY, boxW, boxH);
//             });

//             setFaceImage(canvas.toDataURL('image/jpeg'));
//             setIsBlurred(true);
//         } catch (err) {
//             console.error('Face detection error:', err);
//             alert("Failed to auto-blur. Please try another image.");
//         } finally { setIsDetecting(false); }
//     };

//     const clearFaceImage = () => {
//         setFaceImage(null);
//         setOriginalFaceImage(null);
//         setIsBlurred(false);
//     };

//     const handleGenerateQuestions = async () => {
//         const newErrors = {};
//         if (!faceImage) newErrors.faceImage = "Please upload a clear face image to begin analysis.";
//         if (!formData.age) newErrors.age = "Age is required.";
//         if (!formData.city) newErrors.city = "City is required.";
//         if (!formData.symptoms) newErrors.symptoms = "Please describe your symptoms.";
//         if (!formData.duration) newErrors.duration = "Please enter the duration in days.";
//         if (formData.medicineTaken === 'yes' && !formData.medicineDetails) newErrors.medicineDetails = "Please specify the medicines or treatments taken.";
//         if (!formData.medicalHistory) newErrors.medicalHistory = "Please provide your medical history (or type 'None').";

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             const firstErrorKey = Object.keys(newErrors)[0];
//             const idMap = { faceImage: 'upload-section', age: 'field-age', city: 'field-city', symptoms: 'field-symptoms', duration: 'field-duration', medicineDetails: 'field-medicine-details', medicalHistory: 'field-history' };
//             document.getElementById(idMap[firstErrorKey])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//             return;
//         }

//         setLoading(true);
//         setApiError("");
//         setErrors({});
//         setAiOverloadError(false);

//         try {
//             const res = await fetch("/api/generate-questions", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ faceImage, tongueImage, formData, userId: user.id, patientName: user.name }),
//             });

//             const data = await res.json();
//             // 🛑 NEW: Catch the AI Overload error
//             if (res.status === 503 || data.errorType === "AI_OVERLOADED") {
//                 setAiOverloadError(true);
//                 window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the error
//                 return;
//             }
//             if (data.success) {
//                 setGeneratedQuestions(data.questions);
//                 setRecordId(data.recordId);
//                 // Scroll to top instantly to simulate a page transition
//                 window.scrollTo({ top: 0, behavior: 'instant' });
//             } else {
//                 setApiError(data.message);
//             }
//         } catch (err) {
//             setApiError("Connection error. Please check your network and try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // NEW: Handle option selection
//     const handleOptionSelect = (qId, optionText) => {
//         setAnswers(prev => ({ ...prev, [qId]: optionText }));
//     };

//     // Check if all questions are answered
//     const isAssessmentComplete = generatedQuestions && Object.keys(answers).length === generatedQuestions.length;

//     const handleSubmitFinalAnswers = async () => {
//         setLoading(true);
//         setAiOverloadError(false);
//         try {
//             const res = await fetch("/api/generate-report", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ recordId, answers }),
//             });
//             const data = await res.json();
//             // 🛑 NEW: Catch the AI Overload error
//             if (res.status === 503 || data.errorType === "AI_SERVER_OVERLOADED") {
//                 setAiOverloadError(true);
//                 window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the error
//                 return;
//             }
//             if (data.success) {
//                 router.push(`/results/${recordId}`);
//             } else {
//                 alert("Failed to generate report. Please try again.");
//             }
//         } catch (err) {
//             alert("Connection error.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">

//             <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
//                 <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
//                         <Leaf className="w-5 h-5 text-green-600" />
//                     </div>
//                     <span className="font-bold text-slate-900 text-xl tracking-tight">AyurVision</span>
//                 </div>
//                 <div className="flex items-center gap-6 text-sm font-medium relative">
//                     <Link href="/history" className="text-green-600 border-b-2 border-green-600 pb-1 hover:text-green-700">My Reports</Link>
//                     <div className="group relative">
//                         <div className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm cursor-pointer transition-colors hover:bg-green-700">
//                             {user.name}
//                         </div>
//                         <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
//                             <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium rounded-md">Logout</button>
//                         </div>
//                     </div>
//                 </div>
//             </nav>

//             <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12">

//                 {apiError && (
//                     <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md font-medium shadow-sm flex items-center justify-between sticky top-24 z-40 animate-in fade-in slide-in-from-top-4">
//                         <span>{apiError}</span>
//                         <button onClick={() => setApiError("")} className="text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>
//                     </div>
//                 )}

//                 {/* 🛑 NEW: AI OVERLOAD WARNING BANNER */}
//                 {aiOverloadError && (
//                     <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-xl shadow-sm mb-6 animate-in fade-in slide-in-from-top-2 sticky top-24 z-40">
//                         <div className="flex items-start gap-4">
//                             <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
//                                 <AlertTriangle className="w-6 h-6 text-amber-600" />
//                             </div>
//                             <div>
//                                 <h3 className="font-bold text-amber-900 text-lg mb-1">
//                                     High Traffic Volume
//                                 </h3>
//                                 <p className="text-amber-800 text-sm leading-relaxed">
//                                     Our AI servers are currently experiencing unusually high traffic and could not process your request right now. Please wait a few moments and try submitting again.
//                                 </p>
//                                 <button
//                                     onClick={() => setAiOverloadError(false)}
//                                     className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
//                                 >
//                                     Dismiss
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* --- VIEW 1: THE INITIAL INTAKE FORM --- */}
//                 {!generatedQuestions ? (
//                     <div className="space-y-12 animate-in fade-in duration-500">
//                         <div className="text-center space-y-2">
//                             <h1 className="text-4xl font-bold text-slate-900">Prakriti Analysis</h1>
//                             <p className="text-slate-500 text-lg">Upload your images and provide information to begin your analysis</p>
//                         </div>

//                         <div id="upload-section" className="grid grid-cols-1 md:grid-cols-2 gap-8">

//                             {/* Face Upload */}
//                             <div className="space-y-2 flex flex-col">
//                                 <div className={`bg-white rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center h-full min-h-[300px] relative transition-all ${errors.faceImage ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-green-400'}`}>
//                                     {faceImage ? (
//                                         <div className="w-full h-full flex flex-col items-center justify-center">
//                                             <div className="w-full max-w-[280px] h-[200px] rounded-lg overflow-hidden shadow-sm bg-slate-50 flex items-center justify-center border border-slate-100">
//                                                 <img src={faceImage} alt="Face" className="w-full h-full object-contain" />
//                                             </div>
//                                             <div className="flex gap-4 mt-6">
//                                                 <Button variant="outline" size="sm" onClick={toggleBlurEyes} disabled={isDetecting || !faceApiLoaded} className="text-slate-600 hover:text-slate-900 border-slate-300 bg-white">
//                                                     {isDetecting ? "Detecting..." : isBlurred ? <><Eye className="w-4 h-4 mr-2" /> Unblur Eyes</> : <><EyeOff className="w-4 h-4 mr-2" /> Auto-Blur Eyes</>}
//                                                 </Button>
//                                                 <Button variant="outline" size="sm" onClick={clearFaceImage} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 bg-white">
//                                                     <X className="w-4 h-4 mr-2" /> Clear
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <Label className="cursor-pointer flex flex-col items-center justify-center text-center w-full h-full">
//                                             <UploadCloud className={`w-12 h-12 mb-4 ${errors.faceImage ? 'text-red-500' : 'text-green-600'}`} />
//                                             <span className={`text-xl font-bold ${errors.faceImage ? 'text-red-700' : 'text-slate-800'}`}>Upload Face Image <span className="text-red-500">*</span></span>
//                                             <span className={`mt-2 ${errors.faceImage ? 'text-red-500' : 'text-slate-500'}`}>Click to upload a clear photo of your face</span>
//                                             <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'face')} />
//                                         </Label>
//                                     )}
//                                 </div>
//                                 {/* The error message placeholder */}
//                                 <div className="h-5">
//                                     {errors.faceImage && <p className="text-sm font-medium text-red-500 ml-2">{errors.faceImage}</p>}
//                                 </div>
//                             </div>

//                             {/* Tongue Upload */}
//                             <div className="space-y-2 flex flex-col">
//                                 <div className="bg-white rounded-2xl border-2 border-slate-200 border-dashed p-6 flex flex-col items-center justify-center h-full min-h-[300px] relative transition-all hover:border-green-400">
//                                     {tongueImage ? (
//                                         <div className="w-full h-full flex flex-col items-center justify-center">
//                                             <div className="w-full max-w-[280px] h-[200px] rounded-lg overflow-hidden shadow-sm bg-slate-50 flex items-center justify-center border border-slate-100">
//                                                 <img src={tongueImage} alt="Tongue" className="w-full h-full object-contain" />
//                                             </div>
//                                             <Button variant="outline" size="sm" onClick={() => setTongueImage(null)} className="mt-6 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 bg-white">
//                                                 <X className="w-4 h-4 mr-2" /> Clear Image
//                                             </Button>
//                                         </div>
//                                     ) : (
//                                         <Label className="cursor-pointer flex flex-col items-center justify-center text-center w-full h-full">
//                                             <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
//                                             <span className="text-xl font-bold text-slate-800">Upload Tongue Image <span className="text-slate-400 text-sm font-normal">(Optional)</span></span>
//                                             <span className="text-slate-500 mt-2">Click to upload a clear photo of your tongue</span>
//                                             <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'tongue')} />
//                                         </Label>
//                                     )}
//                                 </div>
//                                 {/* Empty spacer to maintain vertical symmetry with the face error message */}
//                                 <div className="h-5"></div>
//                             </div>

//                         </div>

//                         {(faceImage || tongueImage) && (
//                             <div ref={formRef} className="space-y-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-500">
//                                 <section className="space-y-6">
//                                     <h2 className="text-2xl font-bold border-b pb-2 text-slate-800">Basic Information</h2>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div id="field-age" className="space-y-2">
//                                             <Label className={errors.age ? "text-red-600" : ""}>Age *</Label>
//                                             <Input type="number" min="1" onWheel={(e) => e.target.blur()} placeholder="Enter your age" value={formData.age} onChange={e => { const val = e.target.value; if (val === '' || Number(val) > 0) { setFormData({ ...formData, age: val }); clearError('age'); } }} className={`h-12 bg-white ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400`} />
//                                             {errors.age && <p className="text-sm text-red-500 font-medium">{errors.age}</p>}
//                                         </div>
//                                         <div className="space-y-2">
//                                             <Label>Gender *</Label>
//                                             <select className="flex h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
//                                                 <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
//                                             </select>
//                                         </div>
//                                         <div id="field-city" className="space-y-2">
//                                             <Label className={errors.city ? "text-red-600" : ""}>City *</Label>
//                                             <Input placeholder="Enter your city" value={formData.city} onChange={e => { setFormData({ ...formData, city: e.target.value }); clearError('city'); }} className={`h-12 bg-white ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400`} />
//                                             {errors.city && <p className="text-sm text-red-500 font-medium">{errors.city}</p>}
//                                         </div>
//                                         <div className="space-y-2">
//                                             <Label>Pincode (Optional)</Label>
//                                             <Input placeholder="Enter your pincode" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="h-12 bg-white border-slate-300 focus:border-green-500 focus:ring-green-500 placeholder:text-slate-400" />
//                                         </div>
//                                     </div>
//                                 </section>

//                                 <section className="space-y-6">
//                                     <h2 className="text-2xl font-bold border-b pb-2 text-slate-800">Symptoms Description</h2>
//                                     <div className="space-y-6">
//                                         <div id="field-symptoms" className="space-y-2">
//                                             <Label className={errors.symptoms ? "text-red-600" : ""}>Symptoms *</Label>
//                                             <Textarea placeholder="Describe your symptoms in detail..." value={formData.symptoms} onChange={e => { setFormData({ ...formData, symptoms: e.target.value }); clearError('symptoms'); }} className={`min-h-[120px] bg-white ${errors.symptoms ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400 text-base p-4`} />
//                                             {errors.symptoms && <p className="text-sm text-red-500 font-medium">{errors.symptoms}</p>}
//                                         </div>
//                                         <div id="field-duration" className="space-y-2">
//                                             <Label className={errors.duration ? "text-red-600" : ""}>Duration (Number of Days) *</Label>
//                                             <Input type="number" min="1" onWheel={(e) => e.target.blur()} placeholder="Enter duration in days" value={formData.duration} onChange={e => { const val = e.target.value; if (val === '' || Number(val) > 0) { setFormData({ ...formData, duration: val }); clearError('duration'); } }} className={`h-12 bg-white max-w-xs ${errors.duration ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400`} />
//                                             {errors.duration && <p className="text-sm text-red-500 font-medium">{errors.duration}</p>}
//                                         </div>
//                                     </div>
//                                 </section>

//                                 <section className="space-y-6">
//                                     <h2 className="text-2xl font-bold border-b pb-2 text-slate-800">Medical Treatment History</h2>
//                                     <div className="space-y-6">
//                                         <div className="space-y-3">
//                                             <Label>Medicine or Treatment Taken *</Label>
//                                             <div className="flex gap-6 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-sm">
//                                                 <label className="flex items-center gap-3 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData.medicineTaken === 'yes'} onChange={() => { setFormData({ ...formData, medicineTaken: 'yes' }); }} className="w-5 h-5 accent-green-600" /> Yes</label>
//                                                 <label className="flex items-center gap-3 cursor-pointer text-slate-700 font-medium"><input type="radio" checked={formData.medicineTaken === 'no'} onChange={() => { setFormData({ ...formData, medicineTaken: 'no', medicineDetails: '' }); clearError('medicineDetails'); }} className="w-5 h-5 accent-green-600" /> No</label>
//                                             </div>
//                                         </div>
//                                         {formData.medicineTaken === 'yes' && (
//                                             <div id="field-medicine-details" className="space-y-2 animate-in fade-in slide-in-from-top-2">
//                                                 <Label className={errors.medicineDetails ? "text-red-600" : ""}>What Medicine or Treatment Taken? *</Label>
//                                                 <Input placeholder="Describe the medicines or treatments you have taken..." value={formData.medicineDetails} onChange={e => { setFormData({ ...formData, medicineDetails: e.target.value }); clearError('medicineDetails'); }} className={`h-12 bg-white ${errors.medicineDetails ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400`} />
//                                                 {errors.medicineDetails && <p className="text-sm text-red-500 font-medium">{errors.medicineDetails}</p>}
//                                             </div>
//                                         )}
//                                         <div id="field-history" className="space-y-2">
//                                             <Label className={errors.medicalHistory ? "text-red-600" : ""}>Medical History *</Label>
//                                             <Textarea placeholder="Describe your medical history, past illnesses, surgeries, etc. (Type 'None' if not applicable)" value={formData.medicalHistory} onChange={e => { setFormData({ ...formData, medicalHistory: e.target.value }); clearError('medicalHistory'); }} className={`min-h-[120px] bg-white ${errors.medicalHistory ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'} placeholder:text-slate-400 text-base p-4`} />
//                                             {errors.medicalHistory && <p className="text-sm text-red-500 font-medium">{errors.medicalHistory}</p>}
//                                         </div>
//                                     </div>
//                                 </section>

//                                 <Button onClick={handleGenerateQuestions} disabled={loading} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-all font-semibold">
//                                     {loading ? "Analyzing Profile & Generating Questions..." : "Generate Questions"}
//                                 </Button>
//                             </div>
//                         )}
//                     </div>
//                 ) : (
//                     /* --- VIEW 2: THE INTERACTIVE ASSESSMENT --- */
//                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto">
//                         <div className="text-center space-y-3 mb-10">
//                             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
//                                 <CheckCircle2 className="w-8 h-8 text-green-600" />
//                             </div>
//                             <h2 className="text-4xl font-bold text-slate-900">AI Assessment Ready</h2>
//                             <p className="text-slate-500 text-lg">Please answer the following 5 questions tailored to your profile.</p>
//                         </div>

//                         <div className="space-y-6">
//                             {generatedQuestions.map((q, idx) => (
//                                 <div key={q.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
//                                     <h3 className="font-bold text-xl text-slate-800 mb-6"><span className="text-green-600 mr-2">Q{idx + 1}.</span> {q.text}</h3>
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                         {q.options.map((opt, optIdx) => {
//                                             const isSelected = answers[q.id] === opt;
//                                             return (
//                                                 <div
//                                                     key={optIdx}
//                                                     onClick={() => handleOptionSelect(q.id, opt)}
//                                                     className={`p-4 text-center rounded-xl border-2 cursor-pointer transition-all duration-200 font-medium flex items-center justify-center min-h-[80px]
//                             ${isSelected
//                                                             ? 'border-green-600 bg-green-50 text-green-800 shadow-md transform scale-[1.02]'
//                                                             : 'border-slate-100 hover:border-green-300 hover:bg-slate-50 text-slate-600'
//                                                         }`}
//                                                 >
//                                                     {opt}
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="pt-6 border-t border-slate-200">
//                             <Button
//                                 onClick={handleSubmitFinalAnswers}
//                                 disabled={!isAssessmentComplete || loading}
//                                 className="w-full h-16 text-xl bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
//                             >
//                                 {loading ? (
//                                     <>
//                                         {/* Spinning loading icon */}
//                                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         Analyzing & Generating Report...
//                                     </>
//                                 ) : isAssessmentComplete ? (
//                                     "Submit Final Answers & Get Report ✨"
//                                 ) : (
//                                     `Answer all questions to proceed (${Object.keys(answers).length}/5)`
//                                 )}
//                             </Button>
//                         </div>
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    Camera,
    Check,
    CheckCircle2,
    Clock,
    Eye,
    EyeOff,
    FileText,
    ImageIcon,
    Leaf,
    Loader2,
    PanelRightOpen,
    Pill,
    ShieldCheck,
    Stethoscope,
    UploadCloud,
    X,
} from "lucide-react";
import { AyurNav } from "@/components/ui/ayur-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DiagnosisPage() {
    const router = useRouter();
    const [user, setUser] = useState({ name: "Loading...", id: "" });
    const [originalFaceImage, setOriginalFaceImage] = useState(null);
    const [faceImage, setFaceImage] = useState(null);
    const [tongueImage, setTongueImage] = useState(null);
    const [aiOverloadError, setAiOverloadError] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [faceApiLoaded, setFaceApiLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [errors, setErrors] = useState({});
    const [generatedQuestions, setGeneratedQuestions] = useState(null);
    const [recordId, setRecordId] = useState(null);
    const [answers, setAnswers] = useState({});

    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        age: "",
        gender: "Female",
        city: "",
        pincode: "",
        symptoms: "",
        duration: "",
        medicineTaken: "no",
        medicineDetails: "",
        medicalHistory: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = window.localStorage.getItem("ayurUser");
            const token = window.localStorage.getItem("ayurToken");
            if (storedUser && token) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setTimeout(() => setUser(parsedUser), 0);
                } catch (e) {
                    console.error("Corrupted user data", e);
                    window.localStorage.removeItem("ayurUser");
                    window.localStorage.removeItem("ayurToken");
                    router.push("/auth");
                }
            } else {
                window.sessionStorage.setItem("ayurAuthNotice", "Please log in first to begin your assessment.");
                router.push("/auth");
            }
        }

        const loadModels = async () => {
            try {
                const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
                await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                setFaceApiLoaded(true);
            } catch (error) {
                console.error("Error loading face-api models:", error);
            }
        };

        if (typeof window !== "undefined") {
            if (!window.faceapi) {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js";
                script.async = true;
                script.onload = loadModels;
                document.body.appendChild(script);
            } else {
                loadModels();
            }
        }
    }, [router]);

    const clearError = (field) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "face") {
                setOriginalFaceImage(reader.result);
                setFaceImage(reader.result);
                setIsBlurred(false);
                clearError("faceImage");
            }
            if (type === "tongue") {
                setTongueImage(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const toggleBlurEyes = async () => {
        if (isBlurred) {
            setFaceImage(originalFaceImage);
            setIsBlurred(false);
            return;
        }
        if (!faceApiLoaded || isDetecting || !originalFaceImage) return;
        setIsDetecting(true);

        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = originalFaceImage;
            await new Promise((resolve) => { img.onload = resolve; });

            const detections = await window.faceapi.detectAllFaces(img, new window.faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            if (detections.length === 0) {
                alert("No faces detected by AI. Ensure the image is clear.");
                setIsDetecting(false);
                return;
            }

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            detections.forEach((det) => {
                const lm = det.landmarks;
                const allEyePoints = [...lm.getLeftEye(), ...lm.getRightEye()];
                const minX = Math.min(...allEyePoints.map((p) => p.x));
                const maxX = Math.max(...allEyePoints.map((p) => p.x));
                const minY = Math.min(...allEyePoints.map((p) => p.y));
                const maxY = Math.max(...allEyePoints.map((p) => p.y));

                const width = maxX - minX;
                const height = maxY - minY;
                const paddingX = width * 0.25;
                const paddingY = height * 1.5;
                const startX = Math.max(0, minX - paddingX);
                const startY = Math.max(0, minY - paddingY);
                const boxW = Math.min(canvas.width - startX, width + paddingX * 2);
                const boxH = Math.min(canvas.height - startY, height + paddingY * 2);

                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.filter = "blur(25px)";
                tempCtx.drawImage(img, 0, 0);
                ctx.drawImage(tempCanvas, startX, startY, boxW, boxH, startX, startY, boxW, boxH);
            });

            setFaceImage(canvas.toDataURL("image/jpeg"));
            setIsBlurred(true);
        } catch (err) {
            console.error("Face detection error:", err);
            alert("Failed to auto-blur. Please try another image.");
        } finally {
            setIsDetecting(false);
        }
    };

    const clearFaceImage = () => {
        setFaceImage(null);
        setOriginalFaceImage(null);
        setIsBlurred(false);
    };

    const handleGenerateQuestions = async () => {
        const newErrors = {};
        if (!faceImage) newErrors.faceImage = "Please upload a clear face image to begin analysis.";
        if (!formData.age) newErrors.age = "Age is required.";
        if (!formData.city) newErrors.city = "City is required.";
        if (!formData.symptoms) newErrors.symptoms = "Please describe your symptoms.";
        if (!formData.duration) newErrors.duration = "Please enter the duration in days.";
        if (formData.medicineTaken === "yes" && !formData.medicineDetails) newErrors.medicineDetails = "Please specify the medicines or treatments taken.";
        if (!formData.medicalHistory) newErrors.medicalHistory = "Please provide your medical history or type None.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErrorKey = Object.keys(newErrors)[0];
            const idMap = {
                faceImage: "upload-section",
                age: "field-age",
                city: "field-city",
                symptoms: "field-symptoms",
                duration: "field-duration",
                medicineDetails: "field-medicine-details",
                medicalHistory: "field-history",
            };
            document.getElementById(idMap[firstErrorKey])?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setLoading(true);
        setApiError("");
        setErrors({});
        setAiOverloadError(false);

        try {
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ faceImage, tongueImage, formData, userId: user.id, patientName: user.name }),
            });

            const data = await res.json();
            if (res.status === 503 || data.errorType === "AI_OVERLOADED") {
                setAiOverloadError(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
            if (data.success) {
                setGeneratedQuestions(data.questions);
                setRecordId(data.recordId);
                window.scrollTo({ top: 0, behavior: "instant" });
            } else {
                setApiError(data.message);
            }
        } catch (err) {
            console.error(err);
            setApiError("Connection error. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qId, optionText) => {
        setAnswers((prev) => ({ ...prev, [qId]: optionText }));
    };

    const isAssessmentComplete = generatedQuestions && Object.keys(answers).length === generatedQuestions.length;

    const handleSubmitFinalAnswers = async () => {
        setLoading(true);
        setAiOverloadError(false);
        try {
            const res = await fetch("/api/generate-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recordId, answers }),
            });
            const data = await res.json();
            if (res.status === 503 || data.errorType === "AI_SERVER_OVERLOADED") {
                setAiOverloadError(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }
            if (data.success) {
                router.push(`/results/${recordId}`);
            } else {
                alert("Failed to generate report. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    const hasAnyImage = Boolean(faceImage || tongueImage);

    return (
        <div className="min-h-screen bg-[#F7F3EE] pb-20 text-[#2F2F2F]">
            <AyurNav user={user} onUserChange={setUser} active="assessment" />

            <main className="mx-auto max-w-6xl px-5 pt-28 sm:px-8">
                {apiError && (
                    <AlertBanner tone="red" onDismiss={() => setApiError("")}>
                        {apiError}
                    </AlertBanner>
                )}

                {aiOverloadError && (
                    <AlertBanner tone="amber" onDismiss={() => setAiOverloadError(false)} title="High traffic volume">
                        Our AI servers are experiencing unusually high traffic. Please wait a few moments and try submitting again.
                    </AlertBanner>
                )}

                {!generatedQuestions ? (
                    <div className="space-y-10">
                        <header className="mx-auto max-w-3xl text-center">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Assessment Intake</p>
                            <h1 className="font-display text-4xl font-semibold leading-tight text-[#2F2F2F] sm:text-5xl">Begin your Prakriti analysis</h1>
                            <p className="mt-4 text-base leading-8 text-[#6B6B6B]">
                                Upload your face and optional tongue image first. Your information card will open beside them when an image is added.
                            </p>
                        </header>

                        <div id="upload-section" className={`grid gap-6 ${hasAnyImage ? "lg:grid-cols-[0.88fr_1.12fr] lg:items-start" : ""}`}>
                            <div className={hasAnyImage ? "grid gap-5" : "grid gap-6 md:grid-cols-2"}>
                                <UploadCard
                                    title="Upload Face Image"
                                    subtitle="Required for analysis"
                                    hint="Natural lighting, centered face, no filters"
                                    icon={Camera}
                                    image={faceImage}
                                    error={errors.faceImage}
                                    onUpload={(e) => handleImageUpload(e, "face")}
                                >
                                    {faceImage && (
                                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleBlurEyes}
                                                disabled={isDetecting || !faceApiLoaded}
                                                className="rounded-2xl border-[#E4DCD2] bg-white text-[#2F2F2F] hover:bg-[#F7F3EE]"
                                            >
                                                {isDetecting ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting</>
                                                ) : isBlurred ? (
                                                    <><Eye className="mr-2 h-4 w-4" /> Unblur Eyes</>
                                                ) : (
                                                    <><EyeOff className="mr-2 h-4 w-4" /> Auto-Blur Eyes</>
                                                )}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={clearFaceImage} className="rounded-2xl border-[#F3C0B5] bg-white text-[#9F4A38] hover:bg-[#FFF1EE]">
                                                <X className="mr-2 h-4 w-4" /> Clear
                                            </Button>
                                        </div>
                                    )}
                                </UploadCard>

                                <UploadCard
                                    title="Upload Tongue Image"
                                    subtitle="Optional but recommended"
                                    hint="Clear tongue photo in natural light"
                                    icon={ImageIcon}
                                    image={tongueImage}
                                    onUpload={(e) => handleImageUpload(e, "tongue")}
                                >
                                    {tongueImage && (
                                        <div className="mt-5 flex justify-center">
                                            <Button variant="outline" size="sm" onClick={() => setTongueImage(null)} className="rounded-2xl border-[#F3C0B5] bg-white text-[#9F4A38] hover:bg-[#FFF1EE]">
                                                <X className="mr-2 h-4 w-4" /> Clear Image
                                            </Button>
                                        </div>
                                    )}
                                </UploadCard>
                            </div>

                            {hasAnyImage && (
                                <aside ref={formRef} id="info-panel" className="av-card animate-in slide-in-from-right-8 duration-500">
                                    <div className="border-b border-[#E4DCD2] p-6 sm:p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EA] text-[#4A8B6A]">
                                                <PanelRightOpen className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Your information</p>
                                                <h2 className="font-display mt-1 text-3xl font-semibold text-[#2F2F2F]">Complete your profile</h2>
                                                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">These details guide the generated questions and final report.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 p-6 sm:p-8">
                                        <section className="space-y-5">
                                            <SectionTitle icon={ShieldCheck} title="Basic Information" />
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <FieldShell id="field-age" label="Age *" error={errors.age}>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        onWheel={(e) => e.target.blur()}
                                                        placeholder="Enter your age"
                                                        value={formData.age}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "" || Number(val) > 0) {
                                                                setFormData({ ...formData, age: val });
                                                                clearError("age");
                                                            }
                                                        }}
                                                        className={inputClass(errors.age)}
                                                    />
                                                </FieldShell>

                                                <FieldShell label="Gender *">
                                                    <select
                                                        className="flex h-12 w-full rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] px-4 py-2 text-sm outline-none focus:border-[#6FAF8F] focus:ring-2 focus:ring-[#6FAF8F]/25"
                                                        value={formData.gender}
                                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </FieldShell>

                                                <FieldShell id="field-city" label="City *" error={errors.city}>
                                                    <Input
                                                        placeholder="Enter your city"
                                                        value={formData.city}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, city: e.target.value });
                                                            clearError("city");
                                                        }}
                                                        className={inputClass(errors.city)}
                                                    />
                                                </FieldShell>

                                                <FieldShell label="Pincode">
                                                    <Input
                                                        placeholder="Optional"
                                                        value={formData.pincode}
                                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                        className={inputClass()}
                                                    />
                                                </FieldShell>
                                            </div>
                                        </section>

                                        <section className="space-y-5">
                                            <SectionTitle icon={Stethoscope} title="Symptoms Description" />
                                            <FieldShell id="field-symptoms" label="Symptoms *" error={errors.symptoms}>
                                                <Textarea
                                                    placeholder="Describe your symptoms in detail..."
                                                    value={formData.symptoms}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, symptoms: e.target.value });
                                                        clearError("symptoms");
                                                    }}
                                                    className={`${inputClass(errors.symptoms)} min-h-[120px] p-4`}
                                                />
                                            </FieldShell>
                                            <FieldShell id="field-duration" label="Duration in days *" error={errors.duration}>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    onWheel={(e) => e.target.blur()}
                                                    placeholder="Enter duration"
                                                    value={formData.duration}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || Number(val) > 0) {
                                                            setFormData({ ...formData, duration: val });
                                                            clearError("duration");
                                                        }
                                                    }}
                                                    className={`${inputClass(errors.duration)} max-w-xs`}
                                                />
                                            </FieldShell>
                                        </section>

                                        <section className="space-y-5">
                                            <SectionTitle icon={Pill} title="Treatment History" />
                                            <div className="space-y-3">
                                                <Label className="text-[#2F2F2F]">Medicine or treatment taken *</Label>
                                                <div className="flex max-w-sm gap-3 rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-2">
                                                    {["yes", "no"].map((value) => (
                                                        <label key={value} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${formData.medicineTaken === value ? "bg-white text-[#4A8B6A] shadow-sm" : "text-[#6B6B6B]"}`}>
                                                            <input
                                                                type="radio"
                                                                checked={formData.medicineTaken === value}
                                                                onChange={() => {
                                                                    setFormData({ ...formData, medicineTaken: value, medicineDetails: value === "no" ? "" : formData.medicineDetails });
                                                                    if (value === "no") clearError("medicineDetails");
                                                                }}
                                                                className="sr-only"
                                                            />
                                                            {formData.medicineTaken === value && <Check className="h-4 w-4" />}
                                                            {value === "yes" ? "Yes" : "No"}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {formData.medicineTaken === "yes" && (
                                                <FieldShell id="field-medicine-details" label="What medicine or treatment? *" error={errors.medicineDetails}>
                                                    <Input
                                                        placeholder="Describe medicines or treatments"
                                                        value={formData.medicineDetails}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, medicineDetails: e.target.value });
                                                            clearError("medicineDetails");
                                                        }}
                                                        className={inputClass(errors.medicineDetails)}
                                                    />
                                                </FieldShell>
                                            )}

                                            <FieldShell id="field-history" label="Medical History *" error={errors.medicalHistory}>
                                                <Textarea
                                                    placeholder="Past illnesses, surgeries, long-term concerns, or type None"
                                                    value={formData.medicalHistory}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, medicalHistory: e.target.value });
                                                        clearError("medicalHistory");
                                                    }}
                                                    className={`${inputClass(errors.medicalHistory)} min-h-[120px] p-4`}
                                                />
                                            </FieldShell>
                                        </section>

                                        <Button
                                            onClick={handleGenerateQuestions}
                                            disabled={loading}
                                            className="h-14 w-full rounded-2xl bg-[#6FAF8F] text-base font-semibold text-white shadow-[0_8px_24px_rgba(111,175,143,0.28)] hover:bg-[#4A8B6A]"
                                        >
                                            {loading ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Questions...</>
                                            ) : (
                                                <><FileText className="mr-2 h-5 w-5" /> Generate Questions</>
                                            )}
                                        </Button>
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                ) : (
                    <QuestionnaireView
                        questions={generatedQuestions}
                        answers={answers}
                        loading={loading}
                        isComplete={isAssessmentComplete}
                        onSelect={handleOptionSelect}
                        onSubmit={handleSubmitFinalAnswers}
                    />
                )}
            </main>
        </div>
    );
}

function UploadCard({ title, subtitle, hint, icon: Icon, image, error, onUpload, children }) {
    return (
        <div className="space-y-2">
            <div className={`av-card min-h-[300px] p-6 transition hover:shadow-[0_12px_34px_rgba(47,47,47,0.1)] ${error ? "border-[#F3C0B5] bg-[#FFF1EE]" : ""}`}>
                {image ? (
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] p-2">
                            <img src={image} alt={title} className="h-full max-w-full object-contain" />
                        </div>
                        {children}
                    </div>
                ) : (
                    <Label className="flex min-h-[252px] cursor-pointer flex-col items-center justify-center text-center">
                        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${error ? "bg-[#FBE9D7] text-[#9F4A38]" : "bg-[#E4F1EA] text-[#4A8B6A]"}`}>
                            <Icon className="h-7 w-7" />
                        </div>
                        <span className="font-display text-2xl font-semibold text-[#2F2F2F]">{title}</span>
                        <span className="mt-1 text-sm font-semibold text-[#6FAF8F]">{subtitle}</span>
                        <span className="mt-3 max-w-xs text-sm leading-6 text-[#6B6B6B]">{hint}</span>
                        <span className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#E4DCD2] bg-[#F7F3EE] px-4 py-2 text-sm font-semibold text-[#2F2F2F]">
                            <UploadCloud className="h-4 w-4" />
                            Choose image
                        </span>
                        <Input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                    </Label>
                )}
            </div>
            <div className="min-h-5">{error && <p className="text-sm font-medium text-[#9F4A38]">{error}</p>}</div>
        </div>
    );
}

function AlertBanner({ children, title, tone = "amber", onDismiss }) {
    const isRed = tone === "red";
    return (
        <div className={`sticky top-24 z-30 mb-6 rounded-2xl border p-4 shadow-sm ${isRed ? "border-[#F3C0B5] bg-[#FFF1EE] text-[#9F4A38]" : "border-[#F4D39C] bg-[#FFF6E8] text-[#9A6A1F]"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        {title && <h3 className="font-semibold">{title}</h3>}
                        <p className="text-sm leading-6">{children}</p>
                    </div>
                </div>
                <button type="button" onClick={onDismiss} className="rounded-full p-1 transition hover:bg-white/70">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-3 border-b border-[#E4DCD2] pb-3">
            <Icon className="h-5 w-5 text-[#6FAF8F]" />
            <h3 className="font-display text-2xl font-semibold text-[#2F2F2F]">{title}</h3>
        </div>
    );
}

function FieldShell({ id, label, error, children }) {
    return (
        <div id={id} className="space-y-2">
            <Label className={error ? "text-[#9F4A38]" : "text-[#2F2F2F]"}>{label}</Label>
            {children}
            {error && <p className="text-sm font-medium text-[#9F4A38]">{error}</p>}
        </div>
    );
}

function inputClass(error) {
    return `h-12 rounded-2xl bg-[#F7F3EE] placeholder:text-[#9B9288] focus-visible:ring-[#6FAF8F] ${error ? "border-[#D4856A] focus-visible:ring-[#D4856A]" : "border-[#E4DCD2]"}`;
}

function QuestionnaireView({ questions, answers, loading, isComplete, onSelect, onSubmit }) {
    return (
        <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <header className="mb-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F1EA] text-[#4A8B6A]">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6B6B]">Generated Questions</p>
                <h1 className="font-display text-4xl font-semibold text-[#2F2F2F]">AI assessment ready</h1>
                <p className="mt-4 text-base leading-8 text-[#6B6B6B]">Answer each personalized question to generate your report.</p>
            </header>

            <div className="mb-8 flex items-center gap-2">
                {questions.map((q) => {
                    const done = Boolean(answers[q.id]);
                    return <div key={q.id} className={`h-1.5 flex-1 rounded-full ${done ? "bg-[#6FAF8F]" : "bg-[#E4DCD2]"}`} />;
                })}
                <span className="ml-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">
                    {Object.keys(answers).length}/{questions.length}
                </span>
            </div>

            <div className="space-y-5">
                {questions.map((q, idx) => (
                    <article key={q.id} className="av-card p-6 sm:p-8">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B6B]">Question {idx + 1} of {questions.length}</p>
                        <h2 className="font-display text-2xl font-semibold leading-tight text-[#2F2F2F]">{q.text}</h2>
                        <div className="mt-6 space-y-3">
                            {q.options.map((opt, optIdx) => {
                                const isSelected = answers[q.id] === opt;
                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() => onSelect(q.id, opt)}
                                        className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${isSelected ? "border-[#6FAF8F] bg-[#E4F1EA]" : "border-[#E4DCD2] bg-[#F7F3EE] hover:border-[#6FAF8F]"}`}
                                    >
                                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-[#6FAF8F] bg-[#6FAF8F]" : "border-[#CFC6BB]"}`}>
                                            {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                                        </span>
                                        <span className="text-sm font-medium leading-6 text-[#2F2F2F]">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </article>
                ))}
            </div>

            <Button
                onClick={onSubmit}
                disabled={!isComplete || loading}
                className="mt-8 h-14 w-full rounded-2xl bg-[#2F2F2F] text-base font-semibold text-white shadow-[0_12px_34px_rgba(47,47,47,0.16)] hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing and Generating Report...</>
                ) : isComplete ? (
                    <><Leaf className="mr-2 h-5 w-5" /> Submit Answers and Get Report</>
                ) : (
                    <>
                        <Clock className="mr-2 h-5 w-5" />
                        Answer all questions to proceed
                    </>
                )}
            </Button>
        </div>
    );
}
