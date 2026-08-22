"use client";

import React, { useState, useEffect } from "react";
import { calculateSmsUnits, generateApiKey } from "@/lib/sms";
import { printSmsPdfReport } from "@/lib/pdf-report";
import {
  Send,
  Globe,
  CreditCard,
  Key,
  History,
  Settings,
  Plus,
  RefreshCw,
  Copy,
  Check,
  PauseCircle,
  PlayCircle,
  XCircle,
  Edit,
  DollarSign,
  Smartphone,
  Search,
  Code,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Terminal,
  Zap,
  Bell,
  Slash,
  MessageSquare,
  ShieldAlert,
  FileText,
  Calendar,
  Download,
} from "lucide-react";

export interface SmsManagementProps {
  activeSubTab?: "overview" | "send" | "websites" | "logs" | "docs" | "settings";
  onSubTabChange?: (tab: "overview" | "send" | "websites" | "logs" | "docs" | "settings") => void;
  hideSubTabsNav?: boolean;
}

export function formatBdt(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(n)) return "৳ 0.00";
  return `৳ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SmsManagement({
  activeSubTab: externalSubTab,
  onSubTabChange,
  hideSubTabsNav = false,
}: SmsManagementProps = {}) {
  const [internalSubTab, setInternalSubTab] = useState<"overview" | "send" | "websites" | "logs" | "docs" | "settings">("overview");

  const activeSubTab = externalSubTab || internalSubTab;
  const setActiveSubTab = (tab: "overview" | "send" | "websites" | "logs" | "docs" | "settings") => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  const [origin, setOrigin] = useState("https://yourdomain.com");

  // Global State
  const [websites, setWebsites] = useState<any[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Selected Website Sheet Drawer State
  const [selectedSiteForSheet, setSelectedSiteForSheet] = useState<any | null>(null);
  const [sheetSubTab, setSheetSubTab] = useState<"overview" | "recharge" | "notice" | "status" | "logs" | "docs">("overview");

  // Master Settings State
  const [masterSettings, setMasterSettings] = useState({
    providerApiKey: "",
    providerSenderId: "",
    defaultRate: 0.35,
  });
  const [providerBalance, setProviderBalance] = useState<string>("Loading...");
  const [isLoadingProviderBalance, setIsLoadingProviderBalance] = useState(false);

  // Add / Edit Website Modal
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [newSiteData, setNewSiteData] = useState({
    name: "",
    domain: "",
    balance: "500",
    ratePerSms: "0.35",
    clientPhone: "",
  });

  // Edit Balance Modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedSiteForBalance, setSelectedSiteForBalance] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceActionType, setBalanceActionType] = useState<"add" | "set">("add");
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  // Edit Rate Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedSiteForRate, setSelectedSiteForRate] = useState<any>(null);
  const [newRateValue, setNewRateValue] = useState("");
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Edit Notice Modal
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedSiteForNotice, setSelectedSiteForNotice] = useState<any>(null);
  const [noticeText, setNoticeText] = useState("");
  const [noticeType, setNoticeType] = useState<"info" | "warning" | "urgent">("info");
  const [noticeEnabled, setNoticeEnabled] = useState(false);
  const [isUpdatingNotice, setIsUpdatingNotice] = useState(false);

  // Send SMS Form State
  const [sendForm, setSendForm] = useState({
    siteId: "master",
    recipients: "",
    message: "",
    senderId: "",
    schedule: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Log Filters State
  const [logSearch, setLogSearch] = useState("");
  const [logSiteFilter, setLogSiteFilter] = useState("all");
  const [logStatusFilter, setLogStatusFilter] = useState("all");

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Copy API Key feedback state
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // API Docs Website Selector & Snippet State
  const [selectedDocWebsiteId, setSelectedDocWebsiteId] = useState<string>("demo");
  const [docCopiedSnippetId, setDocCopiedSnippetId] = useState<string | null>(null);

  const handleCopyDocSnippet = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setDocCopiedSnippetId(snippetId);
    setTimeout(() => setDocCopiedSnippetId(null), 2000);
  };

  // PDF Report Export Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfFilterType, setPdfFilterType] = useState<"all" | "month" | "year" | "custom">("all");
  const [pdfMonth, setPdfMonth] = useState<number>(new Date().getMonth() + 1);
  const [pdfYear, setPdfYear] = useState<number>(new Date().getFullYear());
  const [pdfStartDate, setPdfStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [pdfEndDate, setPdfEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [pdfTargetSiteId, setPdfTargetSiteId] = useState<string>("all");

  // Handle PDF Export Generation
  const handleGeneratePdfReport = () => {
    let filtered = [...smsLogs];

    // Filter by website if specific
    if (pdfTargetSiteId !== "all") {
      filtered = filtered.filter((l) => l.websiteId === pdfTargetSiteId);
    }

    let dateRangeTitle = "";

    if (pdfFilterType === "all") {
      dateRangeTitle = "অল টাইম (All Time Full History)";
    } else if (pdfFilterType === "month") {
      filtered = filtered.filter((l) => {
        const d = new Date(l.sentAt);
        return d.getMonth() + 1 === Number(pdfMonth) && d.getFullYear() === Number(pdfYear);
      });
      const monthNames = [
        "জানুয়ারি (Jan)", "ফেব্রুয়ারি (Feb)", "মার্চ (Mar)", "এপ্রিল (Apr)", 
        "মে (May)", "জুন (Jun)", "জুলাই (Jul)", "আগস্ট (Aug)", 
        "সেপ্টেম্বর (Sep)", "অক্টোবর (Oct)", "নভেম্বর (Nov)", "ডিসেম্বর (Dec)"
      ];
      dateRangeTitle = `মাস: ${monthNames[pdfMonth - 1]} ${pdfYear}`;
    } else if (pdfFilterType === "year") {
      filtered = filtered.filter((l) => {
        const d = new Date(l.sentAt);
        return d.getFullYear() === Number(pdfYear);
      });
      dateRangeTitle = `বছর: ${pdfYear}`;
    } else if (pdfFilterType === "custom") {
      const start = new Date(pdfStartDate);
      const end = new Date(pdfEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((l) => {
        const d = new Date(l.sentAt);
        return d >= start && d <= end;
      });
      dateRangeTitle = `কাস্টম তারিখ: ${pdfStartDate} থেকে ${pdfEndDate}`;
    }

    let siteName = "All Websites";
    let domainName = "";
    if (pdfTargetSiteId !== "all") {
      const siteObj = websites.find((w) => w.id === pdfTargetSiteId);
      if (siteObj) {
        siteName = siteObj.name;
        domainName = siteObj.domain;
      }
    }

    printSmsPdfReport({
      title: "SMS History & Charge Statement",
      websiteName: siteName,
      domain: domainName,
      dateRangeText: dateRangeTitle,
      logs: filtered,
    });

    setShowPdfModal(false);
  };

  // API Playground State
  const [playgroundSiteKey, setPlaygroundSiteKey] = useState("");
  const [playgroundPhone, setPlaygroundPhone] = useState("8801800000000");
  const [playgroundMsg, setPlaygroundMsg] = useState("Test SMS from API Playground");
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Fetch Websites from Server API
  const fetchWebsites = async () => {
    setLoadingWebsites(true);
    try {
      const res = await fetch("/api/admin/websites");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setWebsites(json.data);
        if (json.data.length > 0 && !playgroundSiteKey) {
          setPlaygroundSiteKey(json.data[0].apiKey || "");
        }
      }
    } catch (err) {
      console.error("Error fetching websites:", err);
    } finally {
      setLoadingWebsites(false);
    }
  };

  // Fetch Logs from Server API
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/logs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSmsLogs(json.data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch Master Settings from Server API
  const fetchMasterSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setMasterSettings({
          providerApiKey: json.data.providerApiKey || "",
          providerSenderId: json.data.providerSenderId || "",
          defaultRate: json.data.defaultRate || 0.35,
        });
      }
    } catch (err) {
      console.error("Error loading master settings:", err);
    }
  };

  // Fetch Provider Balance from sms.net.bd
  const fetchProviderBalance = async () => {
    setIsLoadingProviderBalance(true);
    try {
      const res = await fetch("/api/admin/sms-provider-balance");
      const data = await res.json();
      if (data.balance) {
        setProviderBalance(data.balance);
      } else {
        setProviderBalance("0.0000");
      }
    } catch {
      setProviderBalance("Error");
    } finally {
      setIsLoadingProviderBalance(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchWebsites();
    fetchLogs();
    fetchMasterSettings();
    fetchProviderBalance();
  }, []);

  // Save Master Settings via Server API
  const handleSaveMasterSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(masterSettings),
      });
      const json = await res.json();
      if (json.success) {
        alert("প্রোভাইডার সেটিংস সফলভাবে সেভ হয়েছে!");
        fetchProviderBalance();
      } else {
        alert("সেটিংস সেভ করতে ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("সেটিংস সেভ করতে ব্যর্থ: " + err.message);
    }
  };

  // Add New Website via Server API
  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteData.name) {
      alert("ওয়েবসাইটের নাম দিন");
      return;
    }

    setIsCreatingSite(true);
    try {
      const res = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSiteData),
      });
      const json = await res.json();

      if (json.success) {
        setShowAddSiteModal(false);
        setNewSiteData({
          name: "",
          domain: "",
          balance: "500",
          ratePerSms: "0.35",
          clientPhone: "",
        });
        fetchWebsites();
      } else {
        alert("ওয়েবসাইট তৈরি করতে সমস্যা হয়েছে: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("ওয়েবসাইট তৈরি করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setIsCreatingSite(false);
    }
  };

  // Update Website Account Status (Active / Pause / Block / Terminate) via Server API
  const handleUpdateStatus = async (siteId: string, newStatus: "active" | "paused" | "blocked" | "terminated") => {
    const statusTitles = { 
      active: "সক্রিয় (Active)", 
      paused: "পজ (Pause)", 
      blocked: "ব্লকড (Block)", 
      terminated: "টারমিনেট (Terminate)" 
    };
    if (!confirm(`আপনি কি এই একাউন্টের স্ট্যাটাস "${statusTitles[newStatus]}" করতে চান?`)) return;

    try {
      const res = await fetch("/api/admin/websites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: siteId, action: "update_status", status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchWebsites();
      } else {
        alert("স্ট্যাটাস পরিবর্তন ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("স্ট্যাটাস পরিবর্তন ব্যর্থ: " + err.message);
    }
  };

  // Save Website Notice via Server API
  const handleSaveNotice = async () => {
    if (!selectedSiteForNotice) return;
    setIsUpdatingNotice(true);
    try {
      const res = await fetch("/api/admin/websites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSiteForNotice.id,
          action: "update_notice",
          noticeText,
          noticeType,
          noticeEnabled,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setShowNoticeModal(false);
        setSelectedSiteForNotice(null);
        setNoticeText("");
        fetchWebsites();
      } else {
        alert("নোটিশ সেভ করতে ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("নোটিশ সেভ করতে ব্যর্থ: " + err.message);
    } finally {
      setIsUpdatingNotice(false);
    }
  };

  // Save Balance Update via Server API
  const handleSaveBalance = async () => {
    if (!selectedSiteForBalance || !balanceAmount) return;
    const amountNum = parseFloat(balanceAmount);
    if (isNaN(amountNum)) {
      alert("সঠিক টাকার পরিমাণ লিখুন");
      return;
    }

    setIsUpdatingBalance(true);
    try {
      const newBalance =
        balanceActionType === "add"
          ? Number(((selectedSiteForBalance.balance || 0) + amountNum).toFixed(4))
          : amountNum;

      const res = await fetch("/api/admin/websites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSiteForBalance.id, action: "update_balance", balance: newBalance }),
      });
      const json = await res.json();

      if (json.success) {
        setShowBalanceModal(false);
        setSelectedSiteForBalance(null);
        setBalanceAmount("");
        fetchWebsites();
      } else {
        alert("ব্যালেন্স আপডেট করতে ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("ব্যালেন্স আপডেট করতে ব্যর্থ: " + err.message);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Save Rate Update via Server API
  const handleSaveRate = async () => {
    if (!selectedSiteForRate || !newRateValue) return;
    const rateNum = parseFloat(newRateValue);
    if (isNaN(rateNum) || rateNum < 0) {
      alert("সঠিক চার্জের পরিমাণ লিখুন");
      return;
    }

    setIsUpdatingRate(true);
    try {
      const res = await fetch("/api/admin/websites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSiteForRate.id, action: "update_rate", ratePerSms: rateNum }),
      });
      const json = await res.json();

      if (json.success) {
        setShowRateModal(false);
        setSelectedSiteForRate(null);
        setNewRateValue("");
        fetchWebsites();
      } else {
        alert("এসএমএস চার্জ সেটিং ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("এসএমএস চার্জ সেটিং ব্যর্থ: " + err.message);
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Regenerate API Key via Server API
  const handleRegenerateApiKey = async (site: any) => {
    if (!confirm(`আপনি কি "${site.name}" এর জন্য নতুন API Key তৈরি করতে চান? আগের Key দিয়ে আর SMS পাঠানো যাবে না।`)) return;

    try {
      const res = await fetch("/api/admin/websites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: site.id, action: "regenerate_key" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("নতুন API Key তৈরি হয়েছে!");
        fetchWebsites();
      } else {
        alert("API Key তৈরিতে ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("API Key তৈরিতে ব্যর্থ: " + err.message);
    }
  };

  // Delete Website via Server API
  const handleDeleteWebsite = async (siteId: string, name: string) => {
    if (!confirm(`আপনি কি সত্যিই "${name}" ওয়েবসাইট মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/admin/websites?id=${siteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchWebsites();
      } else {
        alert("মুছে ফেলতে ব্যর্থ: " + (json.error || "Server Error"));
      }
    } catch (err: any) {
      alert("মুছে ফেলতে ব্যর্থ: " + err.message);
    }
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Submit Send SMS from Dashboard
  const handleDashboardSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendFeedback(null);

    if (!sendForm.recipients.trim()) {
      setSendFeedback({ type: "error", msg: "প্রাপকের ফোন নম্বর লিখুন।" });
      return;
    }
    if (!sendForm.message.trim()) {
      setSendFeedback({ type: "error", msg: "মেসেজ লিখুন।" });
      return;
    }

    setIsSending(true);

    try {
      let targetApiKey = masterSettings.providerApiKey;
      if (sendForm.siteId !== "master") {
        const site = websites.find((w) => w.id === sendForm.siteId);
        if (site && site.apiKey) {
          targetApiKey = site.apiKey;
        }
      }

      const payload = {
        api_key: targetApiKey,
        to: sendForm.recipients,
        msg: sendForm.message,
        sender_id: sendForm.senderId || undefined,
        schedule: sendForm.schedule || undefined,
      };

      const res = await fetch("/api/v1/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.error === 0) {
        setSendFeedback({
          type: "success",
          msg: `এসএমএস সফলভাবে সাবমিট হয়েছে! (Request ID: ${result.data?.request_id}, Charge: ৳${result.data?.charge})`,
        });
        setSendForm({ ...sendForm, recipients: "", message: "" });
        fetchProviderBalance();
        fetchLogs();
        fetchWebsites();
      } else {
        setSendFeedback({
          type: "error",
          msg: `ব্যর্থ হয়েছে: ${result.msg || "অজানা ত্রুটি"} (Error code: ${result.error})`,
        });
      }
    } catch (err: any) {
      setSendFeedback({ type: "error", msg: "সার্ভারে যোগাযোগ করতে ব্যর্থ: " + err.message });
    } finally {
      setIsSending(false);
    }
  };

  // Run API Playground test
  const handleRunPlayground = async () => {
    if (!playgroundSiteKey) {
      alert("API Key নির্বাচন করুন");
      return;
    }
    setIsTestingApi(true);
    setPlaygroundResult(null);

    try {
      const res = await fetch("/api/v1/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: playgroundSiteKey,
          to: playgroundPhone,
          msg: playgroundMsg,
        }),
      });
      const data = await res.json();
      setPlaygroundResult({ status: res.status, body: data });
      fetchLogs();
      fetchWebsites();
    } catch (err: any) {
      setPlaygroundResult({ error: err.message });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Calculations for dashboard summary stats
  const totalWebsitesCount = websites.length;
  const activeWebsitesCount = websites.filter((w) => w.status === "active").length;
  const totalClientBalanceSum = websites.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalSmsSentCount = smsLogs.filter((l) => l.status === "Sent").length;
  const totalRevenueSum = smsLogs.reduce((acc, curr) => acc + (curr.charge || 0), 0);

  // Current message stats calculation
  const smsCalc = calculateSmsUnits(sendForm.message);
  const recipientCount = sendForm.recipients
    ? sendForm.recipients.split(",").filter((p) => p.trim().length > 0).length
    : 0;

  let activeSiteRate = masterSettings.defaultRate;
  if (sendForm.siteId !== "master") {
    const s = websites.find((w) => w.id === sendForm.siteId);
    if (s && s.ratePerSms) activeSiteRate = s.ratePerSms;
  }
  const estimatedCost = (smsCalc.parts * recipientCount * activeSiteRate).toFixed(2);

  // Filtered Logs
  const filteredLogs = smsLogs.filter((log) => {
    const matchesSearch =
      !logSearch ||
      (log.recipient && log.recipient.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.message && log.message.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.websiteName && log.websiteName.toLowerCase().includes(logSearch.toLowerCase()));

    const matchesSite =
      logSiteFilter === "all" ||
      (logSiteFilter === "master" && log.websiteId === "master") ||
      log.websiteId === logSiteFilter;

    const matchesStatus = logStatusFilter === "all" || log.status === logStatusFilter;

    return matchesSearch && matchesSite && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl shadow-lg shadow-indigo-600/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  SMS Gateway & Multi-Tenant Management
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live System
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  sms.net.bd প্রোভাইডার ইন্টিগ্রেশন, ব্যালেন্স কন্ট্রোল, এপিআই কী ও ওয়েবসাইট ম্যানেজমেন্ট
                </p>
              </div>
            </div>
          </div>

          {/* Upstream Provider Balance Widget */}
          <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition">
            <div>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> sms.net.bd প্রোভাইডার ব্যালেন্স
              </div>
              <div className={`text-2xl font-black tracking-tight mt-0.5 ${
                isNaN(Number(providerBalance)) ? "text-amber-400 text-xs font-semibold" : "text-emerald-400"
              }`}>
                {isNaN(Number(providerBalance)) ? providerBalance : formatBdt(providerBalance)}
              </div>
            </div>
            <button
              onClick={fetchProviderBalance}
              disabled={isLoadingProviderBalance}
              title="রিফ্রেশ করুন"
              className="p-2.5 bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-xl transition border border-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProviderBalance ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Missing API Key Warning Banner */}
        {(!masterSettings.providerApiKey || masterSettings.providerApiKey === "YOUR_API_KEY" || isNaN(Number(providerBalance))) && (
          <div className="mt-5 bg-amber-950/80 border border-amber-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-200 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-amber-300 block text-sm">sms.net.bd মাস্টার API Key সেটিংসে বসানো নেই</span>
                <span>আপনার portal.sms.net.bd অ্যাকাউন্ট থেকে আসল API Key এনে &quot;প্রোভাইডার সেটিংস&quot; অপশনে বসালেই লাইভ ব্যালেন্স দেখতে পাবেন।</span>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab("settings")}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shrink-0 shadow-lg shadow-amber-600/30"
            >
              API Key প্রদান করুন
            </button>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        {!hideSubTabsNav && (
          <div className="flex items-center gap-2.5 overflow-x-auto mt-6 pt-5 border-t border-slate-800/80">
            {[
              { id: "overview", label: "ওভারভিউ (Overview)", icon: Sparkles },
              { id: "send", label: "এসএমএস পাঠান (Send)", icon: Send },
              { id: "websites", label: "ওয়েবসাইট ও API Keys", icon: Key },
              { id: "logs", label: "এসএমএস হিস্ট্রি (Logs)", icon: History },
              { id: "docs", label: "API ডকুমেন্টেশন", icon: Code },
              { id: "settings", label: "প্রোভাইডার সেটিংস", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/30"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SUB-TAB CONTENT 1: OVERVIEW */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-indigo-500/40 transition group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">রেজিস্টার্ড ওয়েবসাইট</span>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-3">{totalWebsitesCount} টি</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-bold">{activeWebsitesCount} টি</span> সক্রিয় সার্ভিস চালু রয়েছে
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-emerald-500/40 transition group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">মোট ক্লায়েন্ট ব্যালেন্স</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-3">{formatBdt(totalClientBalanceSum)}</div>
              <div className="text-xs text-slate-400 mt-1">সব সাইটে বর্তমানে জমা রয়েছে</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-indigo-500/40 transition group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">মোট সেন্ট (Sent SMS)</span>
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition">
                  <Send className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-3">{totalSmsSentCount} টি</div>
              <div className="text-xs text-slate-400 mt-1">সফলভাবে ক্লায়েন্টকে ডেলিভারি</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-xl hover:border-amber-500/40 transition group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">মোট সার্ভিস রেভিনিউ</span>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-400 mt-3">{formatBdt(totalRevenueSum)}</div>
              <div className="text-xs text-slate-400 mt-1">এসএমএস সার্ভিস থেকে মোট আয়</div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setNewSiteData({ name: "", domain: "", balance: "500", ratePerSms: "0.35", clientPhone: "" });
                setShowAddSiteModal(true);
              }}
              className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-3 transition text-left group shadow-lg"
            >
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">নতুন ওয়েবসাইট</span>
                <span className="text-[10px] text-slate-400">নতুন সাইট যুক্ত করুন</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("send")}
              className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-3 transition text-left group shadow-lg"
            >
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">এসএমএস পাঠান</span>
                <span className="text-[10px] text-slate-400">ইনস্ট্যান্ট ব্রডকাস্ট</span>
              </div>
            </button>

            <button
              onClick={() => {
                setPdfTargetSiteId("all");
                setShowPdfModal(true);
              }}
              className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-3 transition text-left group shadow-lg"
            >
              <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">পিডিএফ রিপোর্ট</span>
                <span className="text-[10px] text-slate-400">স্টেটমেন্ট ডাউনলোড</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab("docs")}
              className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-3 transition text-left group shadow-lg"
            >
              <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">এপিআই গাইড</span>
                <span className="text-[10px] text-slate-400">কপি কোড স্নিপেট</span>
              </div>
            </button>
          </div>

          {/* Recent SMS History Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> সাম্প্রতিক লাইভ ট্রানজেকশন ও এসএমএস কার্যকলাপ
              </h3>
              <button
                onClick={() => setActiveSubTab("logs")}
                className="text-xs font-bold text-indigo-400 hover:underline"
              >
                সব দেখুন ↗
              </button>
            </div>

            {smsLogs.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                এখনো কোনো এসএমএস পাঠানো হয়নি।
              </div>
            ) : (
              <div className="space-y-2.5">
                {smsLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{log.websiteName}</span>
                          <span className="font-mono text-indigo-300 text-xs">({log.recipient})</span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{log.message}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-emerald-400 font-bold text-xs block">{formatBdt(log.charge || 0)}</span>
                      <span className="text-[10px] text-slate-500 block">{new Date(log.sentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 2: SEND SMS */}
      {activeSubTab === "send" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" /> এসএমএস কম্পোজার (Send SMS)
              </h2>
              <span className="text-xs text-slate-400">একক বা একাধিক নাম্বারে কমা (,) দিয়ে মেসেজ পাঠান</span>
            </div>

            {sendFeedback && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  sendFeedback.type === "success"
                    ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                    : "bg-rose-950/80 border-rose-800 text-rose-200"
                }`}
              >
                {sendFeedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>{sendFeedback.msg}</div>
              </div>
            )}

            <form onSubmit={handleDashboardSendSms} className="space-y-4">
              {/* Account / Sender Website Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রোফাইল / অ্যাকাউন্ট নির্বাচন করুন
                </label>
                <select
                  value={sendForm.siteId}
                  onChange={(e) => setSendForm({ ...sendForm, siteId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="master">মাস্টার এডমিন (Master Provider Key)</option>
                  {websites.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.status !== "active"}>
                      {w.name} ({w.domain || "No domain"}) - ব্যালেন্স: ৳{(w.balance || 0).toFixed(2)}{" "}
                      {w.status !== "active" ? `[${w.status.toUpperCase()}]` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Phone Numbers */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রাপকের নম্বর (Recipients)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01800000000, 8801700000000"
                  value={sendForm.recipients}
                  onChange={(e) => setSendForm({ ...sendForm, recipients: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  একাধিক নম্বরে পাঠাতে কমা (,) ব্যবহার করুন। যেমন: 01800000000, 01700000000
                </p>
              </div>

              {/* Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">মেসেজ বডি (Message Content)</label>
                  <div className="text-[11px] space-x-2">
                    <span className={smsCalc.isUnicode ? "text-amber-400 font-semibold" : "text-indigo-400 font-semibold"}>
                      {smsCalc.isUnicode ? "ইউনিকোড / বাংলা" : "Standard GSM"}
                    </span>
                  </div>
                </div>
                <textarea
                  rows={5}
                  placeholder="আপনার মেসেজ বাংলায় বা ইংরেজিতে লিখুন..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>

              {/* Quick Template Buttons */}
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1.5">দ্রুত টেমপ্লেট নির্বাচন:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "অর্ডার নিশ্চিতকরণ", text: "প্রিয় গ্রাহক, আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। ধন্যবাদ!" },
                    { label: "ওটিপি ভেরিফিকেশন", text: "আপনার ওটিপি কোড হলো: 582910। এটি কারো সাথে শেয়ার করবেন না।" },
                    { label: "পেমেন্ট রিসিভড", text: "ধন্যবাদ! আপনার ৳500 পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।" },
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSendForm({ ...sendForm, message: tpl.text })}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options (Sender ID & Schedule) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sender ID (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="Approved Masking Sender ID"
                    value={sendForm.senderId}
                    onChange={(e) => setSendForm({ ...sendForm, senderId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    শিডিউল সময় (Schedule Date & Time)
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    value={sendForm.schedule}
                    onChange={(e) => setSendForm({ ...sendForm, schedule: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> মেসেজ সাবমিট করুন (Send SMS)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SMS Character & Cost Calculation Side Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 h-fit">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" /> মোট পার্টস ও আনুমানিক খরচ
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">মোট ক্যারেক্টার সংখ্যা:</span>
                <span className="text-white font-bold font-mono">{smsCalc.charCount}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">এসএমএস পার্টস (Parts/SMS):</span>
                <span className="text-indigo-400 font-bold font-mono">{smsCalc.parts} Part(s)</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">প্রাপক সংখ্যা (Recipients):</span>
                <span className="text-white font-bold font-mono">{recipientCount} জন</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">প্রতি পার্ট চার্জ রেট:</span>
                <span className="text-emerald-400 font-bold font-mono">৳ {activeSiteRate}</span>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-950 to-slate-950 rounded-xl border border-indigo-800/40 text-center">
                <span className="text-xs text-slate-300 font-medium block">আনুমানিক মোট খরচ</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">৳ {estimatedCost} BDT</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 3: WEBSITES & API KEYS */}
      {activeSubTab === "websites" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> রেজিস্টার্ড ওয়েবসাইট ও এপিআই কীসমূহ
              </h2>
              <p className="text-xs text-slate-400">
                প্রতিটি অ্যাকাউন্টের ব্যালেন্স, চার্জ নির্ধারণ, API Key তৈরি এবং একাউন্ট স্ট্যাটাস (Active/Pause/Terminate) ম্যানেজ করুন
              </p>
            </div>
            <button
              onClick={() => setShowAddSiteModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> নতুন ওয়েবসাইট যুক্ত করুন
            </button>
          </div>

          {/* Websites Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingWebsites ? (
              <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" /> ওয়েবসাইট ডেটা লোড হচ্ছে...
              </div>
            ) : websites.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                কোন ওয়েবসাইট যুক্ত করা হয়নি। &quot;নতুন ওয়েবসাইট যুক্ত করুন&quot; বাটনে ক্লিক করে যোগ করুন।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5">ওয়েবসাইট ও ক্লায়েন্ট</th>
                      <th className="py-4 px-5">API Key</th>
                      <th className="py-4 px-5">ব্যালেন্স (BDT)</th>
                      <th className="py-4 px-5">এসএমএস রেট</th>
                      <th className="py-4 px-5">স্ট্যাটাস</th>
                      <th className="py-4 px-5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {websites.map((site) => (
                      <tr 
                        key={site.id} 
                        className="hover:bg-slate-800/50 cursor-pointer transition group"
                        onClick={() => setSelectedSiteForSheet(site)}
                      >
                        {/* Name & Domain */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition flex items-center gap-2">
                            <span>{site.name}</span>
                            <span className="text-[10px] font-normal text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 opacity-0 group-hover:opacity-100 transition">
                              ম্যানেজ করুন ↗
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">{site.domain || "No domain"}</div>
                          {site.clientPhone && (
                            <div className="text-[10px] text-indigo-300 mt-0.5">📞 {site.clientPhone}</div>
                          )}
                        </td>

                        {/* API Key */}
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-slate-950 px-2.5 py-1.5 rounded text-indigo-300 border border-slate-800 text-[11px]">
                              {site.apiKey ? `${site.apiKey.substring(0, 16)}...` : "N/A"}
                            </span>
                            <button
                              onClick={() => handleCopyKey(site.apiKey, site.id)}
                              title="Copy API Key"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                            >
                              {copiedKeyId === site.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Balance */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-emerald-400 text-sm">
                            {formatBdt(site.balance || 0)}
                          </div>
                        </td>

                        {/* Rate Per SMS & Notice Indicator */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-200">
                            {formatBdt(site.ratePerSms || 0.35)} / SMS
                          </div>
                          {site.noticeEnabled && (
                            <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
                              <Bell className="w-3 h-3 animate-pulse" /> নোটিশ সক্রিয়
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          {site.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-semibold border border-emerald-800">
                              <PlayCircle className="w-3 h-3" /> সক্রিয় (Active)
                            </span>
                          )}
                          {site.status === "paused" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950 text-amber-400 text-[11px] font-semibold border border-amber-800">
                              <PauseCircle className="w-3 h-3" /> পজ (Paused)
                            </span>
                          )}
                          {site.status === "blocked" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-950 text-red-400 text-[11px] font-semibold border border-red-800">
                              <Slash className="w-3 h-3" /> ব্লকড (Blocked)
                            </span>
                          )}
                          {site.status === "terminated" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950 text-rose-400 text-[11px] font-semibold border border-rose-800">
                              <XCircle className="w-3 h-3" /> টারমিনেটেড
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedSiteForSheet(site)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                            >
                              <Sliders className="w-3.5 h-3.5" /> ম্যানেজ (Sheet)
                            </button>
                            <button
                              onClick={() => handleDeleteWebsite(site.id, site.name)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                              title="Delete Website"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 4: SMS HISTORY & LOGS */}
      {activeSubTab === "logs" && (
        <div className="space-y-6">
          {/* Log Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="ফোন নম্বর বা মেসেজ দিয়ে খুঁজুন..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={logSiteFilter}
                onChange={(e) => setLogSiteFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">সব ওয়েবসাইট</option>
                <option value="master">মাস্টার এডমিন</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="Sent">Sent (সফল)</option>
                <option value="Failed">Failed (ব্যর্থ)</option>
              </select>

              <button
                onClick={() => {
                  setPdfTargetSiteId(logSiteFilter);
                  setShowPdfModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition shrink-0"
              >
                <Download className="w-4 h-4" /> পিডিএফ ডাউনলোড
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingLogs ? (
              <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" /> এসএমএস হিস্ট্রি লোড হচ্ছে...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">কোন এসএমএস পাঠানোর হিস্ট্রি পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">সময় / তারিখ</th>
                      <th className="py-3.5 px-5">ওয়েবসাইট</th>
                      <th className="py-3.5 px-5">প্রাপকের নম্বর</th>
                      <th className="py-3.5 px-5">মেসেজ বডি</th>
                      <th className="py-3.5 px-5">পার্টস</th>
                      <th className="py-3.5 px-5">চার্জ (BDT)</th>
                      <th className="py-3.5 px-5">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredLogs.map((log) => {
                      const sentDate = log.sentAt?.seconds
                        ? new Date(log.sentAt.seconds * 1000).toLocaleString("bn-BD")
                        : "Now";
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-slate-800/50 cursor-pointer transition"
                        >
                          <td className="py-3.5 px-5 text-slate-400 text-[11px] whitespace-nowrap">{sentDate}</td>
                          <td className="py-3.5 px-5 font-semibold text-white">{log.websiteName || "Website"}</td>
                          <td className="py-3.5 px-5 font-mono text-indigo-300">{log.recipient}</td>
                          <td className="py-3.5 px-5 text-slate-300 max-w-xs truncate">{log.message}</td>
                          <td className="py-3.5 px-5 font-mono text-slate-400">{log.smsCount || 1} Part</td>
                          <td className="py-3.5 px-5 font-semibold text-emerald-400">৳ {(log.charge || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-5">
                            {log.status === "Sent" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                                Sent
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800">
                                Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 5: API DOCUMENTATION & PLAYGROUND */}
      {activeSubTab === "docs" && (() => {
        const activeDocSite = websites.find((w) => w.id === selectedDocWebsiteId);
        const activeApiKey = activeDocSite ? activeDocSite.apiKey : "YOUR_WEBSITE_API_KEY";
        const activeSiteName = activeDocSite ? activeDocSite.name : "Custom Website";

        return (
          <div className="space-y-6">
            {/* Top Selector Card */}
            <div className="p-5 bg-gradient-to-r from-indigo-950/80 via-slate-950 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" /> ইন্টিগ্রেশন ক্লায়েন্ট ওয়েবসাইট সিলেক্টর (Website Key Injector)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ওয়েবসাইট সিলেক্ট করলে নিচের সকল কোড স্নিপেটে ওই ওয়েবসাইটের লাইভ API Key সংক্রিয়ভাবে বসে যাবে:
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedDocWebsiteId}
                    onChange={(e) => setSelectedDocWebsiteId(e.target.value)}
                    className="w-full md:w-64 bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
                  >
                    <option value="demo">ডেমো (YOUR_WEBSITE_API_KEY)</option>
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.domain || "No Domain"})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const fullGuide = `=== Liku Media SMS Integration Guide ===
Website Name: ${activeSiteName}
API Key: ${activeApiKey}
SMS Send Endpoint: ${origin}/api/v1/send-sms
Status Endpoint: ${origin}/api/v1/status?api_key=${activeApiKey}

1. Universal Floating Notice & Block Modal Script Tag (HTML):
<script src="${origin}/api/v1/sdk?api_key=${activeApiKey}"></script>

2. cURL Command (Send SMS):
curl -X POST ${origin}/api/v1/send-sms \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "${activeApiKey}",
    "msg": "Hello! Your OTP is 123456",
    "to": "8801800000000"
  }'

3. JavaScript (fetch) Example:
async function sendSms() {
  const res = await fetch("${origin}/api/v1/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: "${activeApiKey}",
      msg: "আপনার অর্ডারটি সফল হয়েছে।",
      to: "8801800000000"
    })
  });
  console.log(await res.json());
}
`;
                      handleCopyDocSnippet(fullGuide, "full_guide");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 shrink-0 transition"
                  >
                    {docCopiedSnippetId === "full_guide" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> কপি হয়েছে!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> কপি সম্পূর্ণ গাইড ফাইল
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" /> এক্সটার্নাল ওয়েবসাইট ইন্টিগ্রেশন নির্দেশিকা (API Docs)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                যেকোনো ওয়েবসাইট (WordPress, WooCommerce, Custom PHP, Node.js, Python, Laravel) থেকে <span className="text-indigo-400 font-bold">{activeSiteName}</span> এর API Key ব্যবহার করে মেসেজ পাঠাতে নিচের এন্ডপয়েন্টটি কল করুন:
              </p>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">POST & GET</span>
                  <span className="text-emerald-400 font-bold">{origin}/api/v1/send-sms</span>
                  <span className="text-slate-400 text-[10px] font-sans">(এসএমএস পাঠানোর জন্য)</span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                  <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">POST & GET</span>
                  <span className="text-amber-400 font-bold">{origin}/api/v1/status?api_key={activeApiKey}</span>
                  <span className="text-slate-400 text-[10px] font-sans">(ব্যালেন্স, ব্লক স্ট্যাটাস & নোটিশ পাওয়ার জন্য)</span>
                </div>
              </div>

              {/* Code Examples */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-white">কোড স্পনিপেট (Code Samples) — <span className="text-indigo-400">{activeSiteName}</span></h3>

                {/* Universal Notice SDK */}
                <div className="space-y-2 p-4 bg-slate-950 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> ১. ইউনিভার্সাল কাস্টমার নোটিশ ও ব্লক ডায়লগ (Universal Floating Dialog SDK)
                    </span>
                    <button
                      onClick={() => handleCopyDocSnippet(`<script src="${origin}/api/v1/sdk?api_key=${activeApiKey}"></script>`, "sdk_tag")}
                      className="text-[11px] bg-amber-950 text-amber-300 font-bold px-2.5 py-1 rounded border border-amber-800 hover:bg-amber-900 transition flex items-center gap-1"
                    >
                      {docCopiedSnippetId === "sdk_tag" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} কপি স্ক্রিপ্ট ট্যাগ
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    যেকোনো ক্লায়েন্ট ওয়েবসাইটের (WordPress, WooCommerce, Custom PHP, React, Laravel) <code className="text-amber-300">&lt;head&gt;</code> বা <code className="text-amber-300">&lt;footer&gt;</code> এ এই ১-লাইনের স্ক্রিপ্ট ট্যাগটি পেস্ট করে দিলে একাউন্ট ব্লক থাকলে বা নোটিশ অন থাকলে যেকোনো ওয়েবসাইটে একই রকম সুন্দর পপ-আপ মেসেজ দেখাবে:
                  </p>
                  <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto select-all">
{`<script src="${origin}/api/v1/sdk?api_key=${activeApiKey}"></script>`}
                  </pre>
                </div>

                {/* Status & Notice Check Example */}
                <div className="space-y-1">
                  <span className="text-xs text-amber-400 font-medium">২. অ্যাকাউন্ট স্ট্যাটাস, নোটিশ & ব্যালেন্স পাওয়ার API কল (`/api/v1/status`)</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto select-all">
{`async function checkWebsiteAccountStatus() {
  const response = await fetch("${origin}/api/v1/status?api_key=${activeApiKey}");
  const result = await response.json();
  
  if (result.data.is_blocked) {
    console.error("Account is Blocked! " + result.msg);
    return;
  }
  
  if (result.data.notice.enabled) {
    alert("এডমিন বার্তা: " + result.data.notice.text);
  }
  
  console.log("Current Balance:", result.data.balance);
}`}
                  </pre>
                </div>

                {/* cURL Example */}
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-medium">৩. cURL Command (Send SMS)</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto select-all">
{`curl -X POST ${origin}/api/v1/send-sms \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "${activeApiKey}",
    "msg": "Hello! Your verification code is 123456",
    "to": "8801800000000"
  }'`}
                  </pre>
                </div>

                {/* Node.js Example */}
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-medium">৪. JavaScript / Node.js (fetch)</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto select-all">
{`async function sendSms() {
  const response = await fetch("${origin}/api/v1/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: "${activeApiKey}",
      msg: "আপনার অর্ডারটি সফল হয়েছে।",
      to: "8801800000000"
    })
  });
  const data = await response.json();
  console.log(data);
}`}
                  </pre>
                </div>

                {/* PHP Example */}
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-medium">৫. PHP / WordPress Snippet</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto select-all">
{`$url = "${origin}/api/v1/send-sms";
$data = array(
    'api_key' => '${activeApiKey}',
    'msg' => 'Test SMS Message',
    'to' => '8801800000000'
);

$options = array(
    'http' => array(
        'header'  => "Content-Type: application/json\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Interactive API Playground */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" /> লাইভ এপিআই টেস্টার (Interactive API Playground)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">API Key সিলেক্ট করুন</label>
                  <select
                    value={playgroundSiteKey}
                    onChange={(e) => setPlaygroundSiteKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.apiKey}>
                        {w.name} ({w.apiKey ? w.apiKey.substring(0, 12) + "..." : "No Key"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">টপ টেস্ট নাম্বার</label>
                  <input
                    type="text"
                    value={playgroundPhone}
                    onChange={(e) => setPlaygroundPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">টেস্ট মেসেজ</label>
                  <input
                    type="text"
                    value={playgroundMsg}
                    onChange={(e) => setPlaygroundMsg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleRunPlayground}
                disabled={isTestingApi}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
              >
                {isTestingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />} টেস্ট কল এক্সিকিউট করুন
              </button>

              {playgroundResult && (
                <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">সার্ভার রেসপন্স (HTTP Response):</span>
                  <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(playgroundResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* SUB-TAB CONTENT 6: PROVIDER SETTINGS */}
      {activeSubTab === "settings" && (
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> sms.net.bd মাস্টার সেটিংস
            </h2>
            <p className="text-xs text-slate-400">
              আপনার মোল SMS প্রোভাইডার Credentials এবং ডিফল্ট গ্লোবাল চার্জ রেট সেটআপ করুন
            </p>
          </div>

          <form onSubmit={handleSaveMasterSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                sms.net.bd Master Provider API Key
              </label>
              <input
                type="text"
                placeholder="YOUR_API_KEY"
                value={masterSettings.providerApiKey}
                onChange={(e) => setMasterSettings({ ...masterSettings, providerApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                sms.net.bd পোর্টাল (portal.sms.net.bd) থেকে আপনার মাস্টার API Key কপি করে এখানে বসান।
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ডিফল্ট Sender ID (ম্যাস্কিং/ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="Approved Masking Sender ID"
                value={masterSettings.providerSenderId}
                onChange={(e) => setMasterSettings({ ...masterSettings, providerSenderId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ডিফল্ট প্রতি-এসএমএস চার্জ (BDT Rate)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.35"
                value={masterSettings.defaultRate}
                onChange={(e) => setMasterSettings({ ...masterSettings, defaultRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              সেটিংস সেভ করুন
            </button>
          </form>
        </div>
      )}

      {/* MODAL 1: ADD NEW WEBSITE */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" /> নতুন ওয়েবসাইট যুক্ত করুন
            </h3>

            <form onSubmit={handleCreateWebsite} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">ওয়েবসাইটের নাম (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. My WooCommerce Store"
                  value={newSiteData.name}
                  onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">ডোমেইন (Domain/URL)</label>
                <input
                  type="text"
                  placeholder="e.g. mystore.com"
                  value={newSiteData.domain}
                  onChange={(e) => setNewSiteData({ ...newSiteData, domain: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">প্রাথমিক ব্যালেন্স (BDT)</label>
                  <input
                    type="number"
                    step="10"
                    value={newSiteData.balance}
                    onChange={(e) => setNewSiteData({ ...newSiteData, balance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">এসএমএস রেট (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSiteData.ratePerSms}
                    onChange={(e) => setNewSiteData({ ...newSiteData, ratePerSms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">ক্লায়েন্ট ফোন নম্বর</label>
                <input
                  type="text"
                  placeholder="01800000000"
                  value={newSiteData.clientPhone}
                  onChange={(e) => setNewSiteData({ ...newSiteData, clientPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSite}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {isCreatingSite ? <RefreshCw className="w-4 h-4 animate-spin" /> : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT BALANCE */}
      {showBalanceModal && selectedSiteForBalance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> ব্যালেন্স পরিবর্তন
            </h3>
            <p className="text-xs text-slate-400">
              ওয়েবসাইট: <span className="text-white font-bold">{selectedSiteForBalance.name}</span>
              <br /> বর্তমান ব্যালেন্স: ৳{(selectedSiteForBalance.balance || 0).toFixed(2)}
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBalanceActionType("add")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    balanceActionType === "add" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  + ব্যালেন্স যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceActionType("set")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    balanceActionType === "set" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  নির্দিষ্ট ব্যালেন্স সেট করুন
                </button>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">টাকার পরিমাণ (BDT)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveBalance}
                  disabled={isUpdatingBalance}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {isUpdatingBalance ? <RefreshCw className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT RATE */}
      {showRateModal && selectedSiteForRate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-400" /> প্রতি-এসএমএস চার্জ পরিবর্তন
            </h3>
            <p className="text-xs text-slate-400">
              ওয়েবসাইট: <span className="text-white font-bold">{selectedSiteForRate.name}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">নতুন SMS চার্জ (BDT / SMS)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.35"
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveRate}
                  disabled={isUpdatingRate}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {isUpdatingRate ? <RefreshCw className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT NOTICE */}
      {showNoticeModal && selectedSiteForNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" /> ওয়েবসাইট নোটিশ সেটিং (Customer Notice)
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              ওয়েবসাইট: <span className="text-white font-bold">{selectedSiteForNotice.name}</span>
            </p>

            <div className="space-y-4 text-xs">
              {/* Notice Enable Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">নোটিশ প্রদর্শন স্ট্যাটাস</span>
                  <span className="text-[10px] text-slate-400">কাস্টমারের ওয়েবসাইট এপিআই রেসপন্সে এই বার্তাটি প্রদর্শন করা হবে</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNoticeEnabled(!noticeEnabled)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    noticeEnabled ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {noticeEnabled ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Off)"}
                </button>
              </div>

              {/* Notice Type Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">নোটিশ ধরন (Notice Type)</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="info">তথ্যমূলক (Information - Info)</option>
                  <option value="warning">সতর্কবার্তা (Warning / Recharge Needed)</option>
                  <option value="urgent">জরুরি বার্তা (Urgent / Maintenance)</option>
                </select>
              </div>

              {/* Notice Message Textarea */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">নোটিশ বার্তা (Message Text)</label>
                <textarea
                  rows={4}
                  placeholder="যেমন: আপনার অ্যাকাউন্টে ব্যালেন্স কম রয়েছে, অনুগ্রহ করে রিচার্জ করুন।"
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotice}
                  disabled={isUpdatingNotice}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  {isUpdatingNotice ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : "নোটিশ সেভ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">এসএমএস ডিটেইলস (Log Details)</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">ওয়েবসাইট:</span>
                  <span className="text-white font-bold">{selectedLog.websiteName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">স্ট্যাটাস:</span>
                  <span className={selectedLog.status === "Sent" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">প্রাপকের নম্বর:</span>
                  <span className="text-indigo-300 font-mono font-bold">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">মোট চার্জ:</span>
                  <span className="text-emerald-400 font-bold">৳ {(selectedLog.charge || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]"> Request ID (Provider):</span>
                  <span className="text-slate-200 font-mono">{selectedLog.providerRequestId || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">মেসেজ পার্টস:</span>
                  <span className="text-slate-200 font-mono">{selectedLog.smsCount || 1} Part</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">সম্পূর্ণ মেসেজ টেক্সট:</span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans select-all">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.errorMsg && (
                <div>
                  <span className="text-rose-400 block mb-1 font-semibold">এরর বার্তা:</span>
                  <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-800 text-rose-200 font-mono text-[11px]">
                    {selectedLog.errorMsg}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: FULL WEBSITE CONTROL SHEET DRAWER */}
      {selectedSiteForSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end transition-opacity duration-300">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedSiteForSheet(null)} 
          />
          
          <div className="relative z-10 w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedSiteForSheet.name}
                    {selectedSiteForSheet.status === "active" && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
                        সক্রিয় (Active)
                      </span>
                    )}
                    {selectedSiteForSheet.status === "paused" && (
                      <span className="text-[10px] bg-amber-950 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-800">
                        পজ (Paused)
                      </span>
                    )}
                    {selectedSiteForSheet.status === "blocked" && (
                      <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-800">
                        ব্লকড (Blocked)
                      </span>
                    )}
                    {selectedSiteForSheet.status === "terminated" && (
                      <span className="text-[10px] bg-rose-950 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-800">
                        টারমিনেট
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedSiteForSheet.domain || "Domain not set"} • ID: {selectedSiteForSheet.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSiteForSheet(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl hover:bg-slate-800 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Live Balance Banner */}
            <div className="p-6 space-y-6 flex-1">
              <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-indigo-950/80 border border-emerald-800/40 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">বর্তমান ক্লায়েন্ট ব্যালেন্স</span>
                  <div className="text-3xl font-black text-emerald-400 mt-1 tracking-tight">
                    {formatBdt(selectedSiteForSheet.balance || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    রেট: <span className="text-slate-200 font-bold">{formatBdt(selectedSiteForSheet.ratePerSms || 0.35)} / SMS</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSiteForBalance(selectedSiteForSheet);
                      setBalanceAmount("");
                      setShowBalanceModal(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" /> ব্যালেন্স পরিবর্তন
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Inside Sheet */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                {[
                  { id: "overview", label: "ওভারভিউ & API Key", icon: Key },
                  { id: "recharge", label: "ব্যালেন্স & রেট", icon: DollarSign },
                  { id: "notice", label: "কাস্টমার নোটিশ", icon: Bell },
                  { id: "status", label: "স্ট্যাটাস & সিকিউরিটি", icon: ShieldAlert },
                  { id: "logs", label: "এসএমএস ইতিহাস", icon: History },
                  { id: "docs", label: "API Docs & গাইড", icon: Code },
                ].map((t) => {
                  const Icon = t.icon || Key;
                  const isActive = sheetSubTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSheetSubTab(t.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                          : "bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* SHEET TAB 1: OVERVIEW & API KEY */}
              {sheetSubTab === "overview" && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">লাইভ API Key (কাস্টমারের ওয়েবসাইটে ব্যবহারের জন্য)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedSiteForSheet.apiKey || ""}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-mono"
                      />
                      <button
                        onClick={() => handleCopyKey(selectedSiteForSheet.apiKey, selectedSiteForSheet.id)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" /> কপি
                      </button>
                      <button
                        onClick={() => {
                          handleRegenerateApiKey(selectedSiteForSheet);
                          setSelectedSiteForSheet(null);
                        }}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl shrink-0"
                        title="নতুন কী জেনারেট"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">মোট পাঠানো মেসেজ</span>
                      <span className="text-xl font-bold text-white mt-1 block">{selectedSiteForSheet.totalSent || 0} টি</span>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">মোট সার্ভিস খরচ</span>
                      <span className="text-xl font-bold text-emerald-400 mt-1 block">
                        {formatBdt(selectedSiteForSheet.totalSpent || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET TAB 2: RECHARGE & RATE */}
              {sheetSubTab === "recharge" && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> কুইক রিচার্জ চিপস (Quick Amount Chips)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[500, 1000, 5000, 10000, 50000, 110000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedSiteForBalance(selectedSiteForSheet);
                            setBalanceAmount(amt.toString());
                            setShowBalanceModal(true);
                          }}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-indigo-600 hover:text-white text-emerald-400 font-mono font-bold rounded-xl border border-slate-800 text-xs transition"
                        >
                          + {formatBdt(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">প্রতি-এসএমএস চার্জ (Rate per SMS)</span>
                      <span className="text-[10px] text-slate-400">বর্তমান চার্জ রেট: {formatBdt(selectedSiteForSheet.ratePerSms || 0.35)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSiteForRate(selectedSiteForSheet);
                        setNewRateValue((selectedSiteForSheet.ratePerSms || 0.35).toString());
                        setShowRateModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4" /> রেট পরিবর্তন
                    </button>
                  </div>
                </div>
              )}

              {/* SHEET TAB 3: NOTICE SETTING */}
              {sheetSubTab === "notice" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">নোটিশ স্ট্যাটাস</span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        selectedSiteForSheet.noticeEnabled ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-slate-800 text-slate-400"
                      }`}>
                        {selectedSiteForSheet.noticeEnabled ? "সক্রিয় (Active)" : "বন্ধ (Disabled)"}
                      </span>
                    </div>

                    {selectedSiteForSheet.noticeText && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-amber-200">
                        &quot;{selectedSiteForSheet.noticeText}&quot;
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedSiteForNotice(selectedSiteForSheet);
                        setNoticeText(selectedSiteForSheet.noticeText || "");
                        setNoticeType(selectedSiteForSheet.noticeType || "info");
                        setNoticeEnabled(Boolean(selectedSiteForSheet.noticeEnabled));
                        setShowNoticeModal(true);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" /> নোটিশ এডিট বা পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              )}

              {/* SHEET TAB 4: STATUS & SECURITY */}
              {sheetSubTab === "status" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-white block">একাউন্ট স্ট্যাটাস পরিবর্তন করুন</span>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSiteForSheet.id, "active");
                          setSelectedSiteForSheet(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          selectedSiteForSheet.status === "active"
                            ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-700"
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" /> Active (সক্রিয়)
                      </button>

                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSiteForSheet.id, "paused");
                          setSelectedSiteForSheet(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          selectedSiteForSheet.status === "paused"
                            ? "bg-amber-950 border-amber-700 text-amber-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-700"
                        }`}
                      >
                        <PauseCircle className="w-4 h-4" /> Pause (পজ)
                      </button>

                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSiteForSheet.id, "blocked");
                          setSelectedSiteForSheet(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          selectedSiteForSheet.status === "blocked"
                            ? "bg-red-950 border-red-700 text-red-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-red-700"
                        }`}
                      >
                        <Slash className="w-4 h-4" /> Block (ব্লকড)
                      </button>

                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedSiteForSheet.id, "terminated");
                          setSelectedSiteForSheet(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          selectedSiteForSheet.status === "terminated"
                            ? "bg-rose-950 border-rose-700 text-rose-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-700"
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> Terminate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET TAB 5: SMS LOGS */}
              {sheetSubTab === "logs" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">সাম্প্রতিক প্রেরিত মেসেজ তালিকা</span>
                      <button
                        onClick={() => {
                          setPdfTargetSiteId(selectedSiteForSheet.id);
                          setShowPdfModal(true);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" /> পিডিএফ রিপোর্ট
                      </button>
                    </div>
                    {smsLogs.filter((l) => l.websiteId === selectedSiteForSheet.id).length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-6">
                        এই ওয়েবসাইট থেকে এখনো কোনো মেসেজ পাঠানো হয়নি।
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {smsLogs
                          .filter((l) => l.websiteId === selectedSiteForSheet.id)
                          .map((log) => (
                            <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-300 font-mono">{log.recipient}</span>
                                <span className="text-emerald-400 font-bold">{formatBdt(log.charge || 0)}</span>
                              </div>
                              <p className="text-slate-300 text-[11px] line-clamp-1">{log.message}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                                <span>{new Date(log.sentAt).toLocaleString()}</span>
                                <span className={log.status === "Sent" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                  {log.status}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SHEET TAB 6: API DOCS FOR THIS WEBSITE */}
              {sheetSubTab === "docs" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">
                        ইন্টিগ্রেশন গাইড — {selectedSiteForSheet.name}
                      </span>
                      <button
                        onClick={() => {
                          const guideText = `=== Liku Media SMS Integration Guide ===
Website: ${selectedSiteForSheet.name}
Domain: ${selectedSiteForSheet.domain || "N/A"}
API Key: ${selectedSiteForSheet.apiKey}

1. Floating Notice & Status Script Tag (HTML):
<script src="${origin}/api/v1/sdk?api_key=${selectedSiteForSheet.apiKey}"></script>

2. cURL Example (Send SMS):
curl -X POST ${origin}/api/v1/send-sms \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "${selectedSiteForSheet.apiKey}",
    "msg": "Test Message",
    "to": "8801800000000"
  }'

3. JavaScript (fetch) Example:
async function sendSms() {
  const res = await fetch("${origin}/api/v1/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: "${selectedSiteForSheet.apiKey}",
      msg: "আপনার অর্ডারটি সফল হয়েছে।",
      to: "8801800000000"
    })
  });
  console.log(await res.json());
}
`;
                          handleCopyDocSnippet(guideText, "sheet_full_guide");
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition shadow"
                      >
                        {docCopiedSnippetId === "sheet_full_guide" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> গাইড কপি হয়েছে!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> কপি গাইড ফাইল
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                      <span className="text-amber-400 font-bold block">
                        ১-লাইনের ইউনিভার্সাল পপ-আপ নোটিশ স্ক্রিপ্ট ট্যাগ (SDK)
                      </span>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
{`<script src="${origin}/api/v1/sdk?api_key=${selectedSiteForSheet.apiKey}"></script>`}
                      </pre>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <span className="text-indigo-400 font-bold block">cURL Command (Send SMS)</span>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto select-all">
{`curl -X POST ${origin}/api/v1/send-sms \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "${selectedSiteForSheet.apiKey}",
    "msg": "Hello! OTP is 123456",
    "to": "8801800000000"
  }'`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sheet Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedSiteForSheet(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                শীট বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PDF REPORT EXPORT FILTER MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" /> এসএমএস স্টেটমেন্ট পিডিএফ ডাউনলোড
              </h3>
              <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Filter Type Buttons */}
              <div>
                <label className="block font-bold text-slate-300 mb-2">ফিল্টারিং মোড নির্বাচন করুন</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfFilterType("all")}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition text-center text-xs ${
                      pdfFilterType === "all"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    ♾️ অল টাইম
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfFilterType("month")}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition text-center text-xs ${
                      pdfFilterType === "month"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    📅 মাসভিত্তিক
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfFilterType("year")}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition text-center text-xs ${
                      pdfFilterType === "year"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    🗓️ বছরভিত্তিক
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfFilterType("custom")}
                    className={`py-2 px-2.5 rounded-xl font-bold border transition text-center text-xs ${
                      pdfFilterType === "custom"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    📆 কাস্টম রেঞ্জ
                  </button>
                </div>
              </div>

              {/* Website Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">ওয়েবসাইট</label>
                <select
                  value={pdfTargetSiteId}
                  onChange={(e) => setPdfTargetSiteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="all">সকল ওয়েবসাইট (All Websites)</option>
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month & Year Selectors */}
              {pdfFilterType === "month" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">মাস (Month)</label>
                    <select
                      value={pdfMonth}
                      onChange={(e) => setPdfMonth(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    >
                      {[
                        "জানুয়ারি (Jan)", "ফেব্রুয়ারি (Feb)", "মার্চ (Mar)", "এপ্রিল (Apr)", 
                        "মে (May)", "জুন (Jun)", "জুলাই (Jul)", "আগস্ট (Aug)", 
                        "সেপ্টেম্বর (Sep)", "অক্টোবর (Oct)", "নভেম্বর (Nov)", "ডিসেম্বর (Dec)"
                      ].map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">বছর (Year)</label>
                    <select
                      value={pdfYear}
                      onChange={(e) => setPdfYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Year Selector */}
              {pdfFilterType === "year" && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">বছর (Year)</label>
                  <select
                    value={pdfYear}
                    onChange={(e) => setPdfYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Date Range Selectors */}
              {pdfFilterType === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">শুরুর তারিখ (Start Date)</label>
                    <input
                      type="date"
                      value={pdfStartDate}
                      onChange={(e) => setPdfStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">শেষের তারিখ (End Date)</label>
                    <input
                      type="date"
                      value={pdfEndDate}
                      onChange={(e) => setPdfEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleGeneratePdfReport}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> পিডিএফ ডাউনলোড করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-500 border-t border-slate-800/60 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>Liku Media Gateway Platform v2.4 • All Systems Operational</div>
        <div>crafted with ❤️ in Rangpur</div>
      </footer>
    </div>
  );
}
