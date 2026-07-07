"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/components/img/likumedia-logo.svg";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpVal, setOtpVal] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation Refs
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Refs for the 6-digit input fields
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // GSAP Initial Entry Animations
  useEffect(() => {
    // 1. Entrance animation for the login container and logo
    if (formWrapperRef.current) {
      gsap.fromTo(
        formWrapperRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
      );
    }

    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.2, ease: "back.out(1.7)" }
      );
    }

    // 2. Cosmic glow slow breathing effect
    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0.3, scale: 0.9 },
        { opacity: 0.7, scale: 1.1, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }
  }, []);

  // GSAP Transition on Step Changes
  useEffect(() => {
    if (formWrapperRef.current) {
      const formElement = formWrapperRef.current.querySelector("form");
      if (formElement) {
        gsap.fromTo(
          formElement,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
        );
      }
    }

    if (step === 2 && inputRefs[0].current) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [step, isOtpMode]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 5) return;
    setError(null);
    setIsSubmitting(true);
    // Simulate sending OTP/Checking user
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && isNaN(Number(value))) return;
    setError(null);

    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    setError(null);
    if (e.key === "Backspace" && !otpVal[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = otpVal.join("");
    if (pinString.length < 6) return;

    setError(null);
    setIsSubmitting(true);

    // Normalize phone number input (removes starting 0, signs, spaces)
    const norm = phone.trim().replace(/^0/, "").replace(/\D/g, "");
    const displayPhone = "+880 " + (norm.startsWith("880") ? norm.substring(3) : norm);

    try {
      // 1. Query Firestore to check if user document already exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", displayPhone));
      const querySnapshot = await getDocs(q);

      let loggedInUser = null;

      if (!querySnapshot.empty) {
        // User exists in the real Firestore database
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.pin !== pinString) {
          setError("Security PIN mismatch. Access denied.");
          
          // GSAP Shake animation on error!
          if (formWrapperRef.current) {
            gsap.fromTo(
              formWrapperRef.current,
              { x: -10 },
              { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
          }
          setIsSubmitting(false);
          return;
        }

        loggedInUser = {
          phone: userData.phone,
          role: userData.role || "client",
          name: userData.name || "Client Partner"
        };
      } else {
        // User is NOT in the database yet. Auto-create/seed user to Firestore!
        if (norm === "1850290529" || norm === "8801850290529") {
          // Validate requested PIN
          if (pinString !== "199800") {
            setError("Incorrect security PIN for seeding. Access denied.");
            
            // GSAP Shake animation on error!
            if (formWrapperRef.current) {
              gsap.fromTo(
                formWrapperRef.current,
                { x: -10 },
                { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
              );
            }
            setIsSubmitting(false);
            return;
          }

          // Auto-seed the Super Admin account into Firestore
          const newDocRef = doc(db, "users", displayPhone);
          const superAdminData = {
            name: "Super Admin",
            phone: displayPhone,
            role: "super_admin",
            pin: "199800",
            createdAt: new Date().toISOString()
          };
          await setDoc(newDocRef, superAdminData);

          loggedInUser = {
            phone: superAdminData.phone,
            role: superAdminData.role,
            name: superAdminData.name
          };
        } else {
          // Auto-seed other test accounts into Firestore for ease of testing
          let role = "client";
          if (phone === "01700000001" || phone === "1700000001") role = "super_admin";
          else if (phone === "01700000002" || phone === "1700000002") role = "admin";
          else if (phone === "01700000003" || phone === "1700000003") role = "manager";

          const newDocRef = doc(db, "users", displayPhone);
          const seedData = {
            name: role.replace("_", " ").toUpperCase(),
            phone: displayPhone,
            role: role,
            pin: pinString,
            createdAt: new Date().toISOString()
          };
          await setDoc(newDocRef, seedData);

          loggedInUser = {
            phone: seedData.phone,
            role: seedData.role,
            name: seedData.name
          };
        }
      }

      if (loggedInUser) {
        setIsSuccess(true);
        localStorage.setItem("liku_user", JSON.stringify(loggedInUser));
        
        // GSAP success fade out and slide-up transition before route push
        if (formWrapperRef.current) {
          gsap.to(formWrapperRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.8,
            delay: 0.8,
            ease: "power3.in"
          });
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }

    } catch (err: any) {
      console.error("Firestore Login Error: ", err);
      setError("Database Connection Timeout: " + (err.message || "Please check Firestore rules."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Starry Space Glow */}
      <div 
        ref={glowRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.06),transparent_60%)] pointer-events-none" 
      />

      <div 
        ref={formWrapperRef}
        className="w-full max-w-sm relative z-10 space-y-8"
      >
        
        {/* Back Button */}
        <div className="text-left">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-all duration-300">
            <ArrowLeft className="size-4 mr-1 transition-transform duration-300 transform hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Simplistic Login Panel */}
        <div className="rounded-none p-4 sm:p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 animate-fade-in-up">
              <div className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-5">
                <ShieldCheck className="size-14 stroke-[1.2]" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Access Granted</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Log in successful. Redirecting to Liku Media secure console dashboard...
              </p>
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Mobile Number Input */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div ref={logoRef} className="flex flex-col items-center justify-center mb-8">
                <Image 
                  src={Logo} 
                  alt="Liku Media" 
                  className="h-10 w-auto object-contain" 
                  priority
                />
              </div>

              <div className="space-y-2 pt-4">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Mobile Number</label>
                <div className="flex items-center rounded-none border border-white/10 bg-white/[0.02] h-12 focus-within:border-primary transition-all duration-200">
                  <div className="flex items-center space-x-1.5 px-4 border-r border-white/10 text-sm font-semibold text-neutral-400 select-none h-full bg-white/[0.01]">
                    <span className="text-base leading-none">🇧🇩</span>
                    <span className="text-xs tracking-wider">+88</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700-000000"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none h-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 5}
                className="w-full group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-primary bg-primary px-10 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary h-12 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2 justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>Proceeding...</span>
                  </span>
                ) : (
                  <span>Next Step</span>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: 6-Digit PIN or OTP Input */
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center mb-8">
                <Image 
                  src={Logo} 
                  alt="Liku Media" 
                  className="h-10 w-auto object-contain" 
                  priority
                />
              </div>

              {/* 6-Digit Input Boxes */}
              <div className="space-y-3 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block text-center">
                  {isOtpMode ? "6-Digit One Time Password" : "6-Digit Secure PIN"}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {otpVal.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="size-11 sm:size-12 rounded-none border border-white/10 bg-white/[0.02] text-center text-lg font-bold text-white outline-none focus:border-primary transition-all duration-200"
                    />
                  ))}
                </div>
              </div>

              {/* Error Message display */}
              {error && (
                <div className="text-xs font-bold text-red-500 text-center mt-2 animate-pulse">
                  {error}
                </div>
              )}

              {/* Toggle PIN / OTP Mode Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setOtpVal(Array(6).fill(""));
                    setError(null);
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-primary transition-colors duration-300"
                >
                  {isOtpMode ? "Use Account PIN instead" : "PIN not set? Use OTP instead"}
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || otpVal.join("").length < 6}
                  className="w-full group relative overflow-hidden inline-flex items-center justify-center rounded-full border border-primary bg-primary px-10 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary h-12 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2 justify-center">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Authorizing...</span>
                    </span>
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpVal(Array(6).fill(""));
                    setError(null);
                  }}
                  className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors duration-300 py-1"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
