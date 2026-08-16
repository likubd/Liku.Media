import React from "react";
import { SmsManagement } from "@/components/sms/sms-management";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DirectSmsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে যান (Go to Main Dashboard)
          </Link>
        </div>

        <SmsManagement />
      </div>
    </div>
  );
}
