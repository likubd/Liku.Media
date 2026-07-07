"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Lock, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpVal, setOtpVal] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs for the 6-digit input fields
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first input when entering Step 2
  useEffect(() => {
    if (step === 2 && inputRefs[0].current) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [step, isOtpMode]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) return;
    setIsSubmitting(true);
    // Simulate sending OTP/Checking user
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otpVal];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    // If typed a character, focus next input
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If backspace and field is empty, focus previous input
    if (e.key === "Backspace" && !otpVal[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = otpVal.join("");
    if (pinString.length < 6) return;

    setIsSubmitting(true);
    // Simulate authentication
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.06),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-8">
        
        {/* Back Button */}
        <div className="text-left">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-all duration-300">
            <ArrowLeft className="size-4 mr-1 transition-transform duration-300 transform hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Simplistic Login Panel */}
        <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 animate-fade-in-up">
              <div className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-5">
                <ShieldCheck className="size-14 stroke-[1.2]" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Access Granted</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Log in successful. Redirecting you to Liku Media client space dashboards...
              </p>
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Mobile Number Input */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">[ Secure Login ]</div>
                <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white">Client Portal</h2>
                <p className="text-xs text-neutral-400 font-light">
                  Please enter your registered mobile number to continue.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +880 1700-000000"
                    className="w-full rounded-none border border-white/10 bg-white/[0.02] pl-11 pr-5 py-3 text-sm text-white outline-none focus:border-primary transition-all duration-200 h-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 8}
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
              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  {isOtpMode ? "[ OTP Verification ]" : "[ Identity Pin ]"}
                </div>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-white">
                  {isOtpMode ? "Enter OTP" : "Enter PIN"}
                </h2>
                <p className="text-xs text-neutral-400 font-light">
                  Sent details to <span className="text-neutral-200 font-bold">{phone}</span>.
                </p>
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

              {/* Toggle PIN / OTP Mode Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setOtpVal(Array(6).fill(""));
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
