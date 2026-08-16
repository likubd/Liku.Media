"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/img/likumedia-logo.svg";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { SmsManagement } from "@/components/sms/sms-management";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Inbox,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Send,
  Key,
  History,
  Code,
  Settings
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{ phone: string; role: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sms" | "users" | "messages">("overview");
  const [smsSubTab, setSmsSubTab] = useState<"overview" | "send" | "websites" | "logs" | "docs" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Modal State for Adding User
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", phone: "", role: "client", pin: "123456" });

  // Database lists
  const [platformUsers, setPlatformUsers] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);

  // Load User Session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("liku_user");
      if (session) {
        setUser(JSON.parse(session));
      } else {
        setUser({ phone: "+880 1850290529", role: "super_admin", name: "SUPER ADMIN" });
      }
    }
  }, []);

  // Fetch Users directly from Cloud Firestore
  const fetchFirestoreUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: any[] = [];
      let migratedAny = false;

      for (const docSnapshot of querySnapshot.docs) {
        const docId = docSnapshot.id;
        const data = docSnapshot.data();
        const userPhone = data.phone;

        if (userPhone && docId !== userPhone) {
          migratedAny = true;
          const cleanDocRef = doc(db, "users", userPhone);
          await setDoc(cleanDocRef, {
            ...data,
            phone: userPhone
          });
          await deleteDoc(doc(db, "users", docId));
        } else {
          usersList.push({
            name: data.name || "Unnamed User",
            role: data.role || "client",
            phone: data.phone || "No Phone",
            status: "Active"
          });
        }
      }

      let finalUsersList = usersList;
      if (migratedAny) {
        const cleanSnapshot = await getDocs(collection(db, "users"));
        finalUsersList = [];
        cleanSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          finalUsersList.push({
            name: data.name || "Unnamed User",
            role: data.role || "client",
            phone: data.phone || "No Phone",
            status: "Active"
          });
        });
      }

      if (finalUsersList.length > 0) {
        setPlatformUsers(finalUsersList);
      } else {
        setPlatformUsers([
          { name: "Tanvir Ahmed", role: "super_admin", phone: "+880 1850290529", status: "Active" },
          { name: "Rafat Kabir", role: "manager", phone: "+880 1700000003", status: "Active" },
        ]);
      }
    } catch (err) {
      console.error("Failed to load Firestore users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch proposal messages from Cloud Firestore
  const fetchFirestoreMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setInboxMessages(list);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchFirestoreUsers();
    if (user && (user.role === "super_admin" || user.role === "admin")) {
      fetchFirestoreMessages();
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFirestoreUsers();
    if (user && (user.role === "super_admin" || user.role === "admin")) {
      await fetchFirestoreMessages();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Add new user to Firestore
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.phone) return;

    const norm = newUserData.phone.trim().replace(/^0/, "").replace(/\D/g, "");
    const fullPhone = "+880 " + (norm.startsWith("880") ? norm.substring(3) : norm);

    try {
      const newDocRef = doc(db, "users", fullPhone);
      const userPayload = {
        name: newUserData.name,
        phone: fullPhone,
        role: newUserData.role,
        pin: newUserData.pin || "123456",
        createdAt: new Date().toISOString()
      };

      await setDoc(newDocRef, userPayload);
      await fetchFirestoreUsers();
      setShowAddModal(false);
      setNewUserData({ name: "", phone: "", role: "client", pin: "123456" });
    } catch (err: any) {
      console.error("Failed to write user to Firestore:", err);
      alert("ইউজার তৈরি করতে সমস্যা হয়েছে: " + (err.message || "Permissions denied"));
    }
  };

  // Delete user from Firestore
  const handleDeleteUser = async (phoneToDelete: string, userName: string) => {
    if (!confirm(`আপনি কি সত্যিই ${userName} ইউজার মুছে ফেলতে চান?`)) return;
    try {
      await deleteDoc(doc(db, "users", phoneToDelete));
      await fetchFirestoreUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      alert("ইউজার মুছে ফেলতে ব্যর্থ: " + (err.message || "Permissions denied"));
    }
  };

  // Delete proposal message from Firestore
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("আপনি কি মেসেজটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "messages", msgId));
      await fetchFirestoreMessages();
    } catch (err: any) {
      console.error("Failed to delete message:", err);
      alert("মেসেজ মুছতে ব্যর্থ: " + (err.message || "Permissions denied"));
    }
  };

  if (!user) return null;

  const navigationItems = [
    { id: "overview", label: "ওভারভিউ (Overview)", icon: LayoutDashboard },
    { id: "sms", label: "এসএমএস গেটওয়ে (SMS)", icon: Smartphone },
    ...(user.role === "super_admin" || user.role === "admin"
      ? [
          { id: "users", label: "ইউজার ডিরেক্টরি (Users)", icon: Users, count: platformUsers.length },
          { id: "messages", label: "ইনবক্স (Inbox)", icon: Inbox, count: inboxMessages.length }
        ]
      : [])
  ];

  const smsSubItems = [
    { id: "overview", label: "ওভারভিউ (Overview)", icon: Sparkles },
    { id: "send", label: "এসএমএস পাঠান (Send)", icon: Send },
    { id: "websites", label: "ওয়েবসাইট ও API Keys", icon: Key },
    { id: "logs", label: "এসএমএস হিস্ট্রি (Logs)", icon: History },
    { id: "docs", label: "API ডকুমেন্টেশন", icon: Code },
    { id: "settings", label: "প্রোভাইডার সেটিংস", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans select-none overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 backdrop-blur-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 border-b border-slate-800/80 px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src={Logo} alt="Liku Media" className="h-8 w-auto object-contain" priority />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <div className="px-4 py-6 space-y-1.5">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>মেনু নেভিগেশন</span>
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSmsItem = item.id === "sms";

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (!isSmsItem) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSmsItem ? (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? "rotate-180 text-white" : "text-slate-400"
                        }`}
                      />
                    ) : (
                      item.count !== undefined &&
                      item.count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-800 text-indigo-400 border border-slate-700"
                          }`}
                        >
                          {item.count}
                        </span>
                      )
                    )}
                  </button>

                  {/* Sub-Sidebar Nested Items for SMS Gateway */}
                  {isSmsItem && isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-indigo-600/60 ml-4 my-1">
                      {smsSubItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = smsSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveTab("sms");
                              setSmsSubTab(sub.id as any);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                              isSubActive
                                ? "bg-indigo-950/80 text-indigo-200 border border-indigo-800/80 font-semibold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? "text-indigo-400" : "text-slate-400"}`} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* User Profile & Actions Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 p-3 rounded-xl mb-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user.name || "Administrator"}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user.phone}</div>
            </div>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded">
              {user.role.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/50 transition"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-20 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {activeTab === "overview" && "সিস্টেম ও কন্ট্রোল ওভারভিউ"}
                {activeTab === "sms" && "SMS Gateway Management"}
                {activeTab === "users" && "ইউজার ডিরেক্টরি"}
                {activeTab === "messages" && "কাস্টমার প্রস্তাবনা ও ইনবক্স"}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Liku Media Cloud Control Center • {user.phone} ({user.role.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Online
            </span>
          </div>
        </header>

        {/* Dynamic Viewport Content */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">নিবন্ধিত ইউজার</span>
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-3">{platformUsers.length}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>সক্রিয় অ্যাকাউন্টস</span>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      দেখুন <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">প্রস্তাবনা ইনবক্স (Inbox)</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <Inbox className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-3">{inboxMessages.length}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>ওয়েবসাইট মেসেজসমূহ</span>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      ইনবক্স খুলুন <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-md sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">এসএমএস গেটওয়ে</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Smartphone className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-blue-400 mt-3">Multi-Tenant Gateway</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span>sms.net.bd ইন্টিগ্রেশন</span>
                    <button
                      onClick={() => setActiveTab("sms")}
                      className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      ম্যানেজ করুন <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setActiveTab("sms")}
                  className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 group-hover:scale-105 transition">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                        SMS Gateway & Website Multi-Tenant
                      </h3>
                      <p className="text-xs text-slate-400">এপিআই কী তৈরি, ব্যালেন্স চার্জ রিচার্জ ও বাল্ক এসএমএস</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end text-xs font-semibold text-indigo-400 gap-1 pt-2">
                    গেটওয়েতে প্রবেশ করুন <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("users")}
                  className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-slate-700 transition group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 group-hover:scale-105 transition">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-slate-200 transition">
                        User Directory Management
                      </h3>
                      <p className="text-xs text-slate-400">নতুন এডমিন/ইউজার যোগ করুন এবং পারমিশন অ্যাক্সেস কন্ট্রোল</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end text-xs font-semibold text-slate-300 gap-1 pt-2">
                    ইউজারদের তালিকা দেখুন <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Recent Inbox Messages */}
              {inboxMessages.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-emerald-400" /> সাম্প্রতিক কাস্টমার মেসেজসমূহ
                    </h3>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      সবগুলো দেখুন ({inboxMessages.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {inboxMessages.slice(0, 3).map((msg, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{msg.name || "Guest User"}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("bn-BD") : "Recent"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{msg.message}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {msg.phone}</span>}
                          {msg.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMS GATEWAY MANAGEMENT */}
          {activeTab === "sms" && (
            <div className="space-y-6">
              <SmsManagement
                activeSubTab={smsSubTab}
                onSubTabChange={(sub) => setSmsSubTab(sub)}
                hideSubTabsNav={true}
              />
            </div>
          )}

          {/* TAB 3: USER DIRECTORY */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> ইউজার ডিরেক্টরি ও অ্যাকাউন্ট কন্ট্রোল
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cloud Firestore-এ সংরক্ষিত রেজিস্টার্ড এডমিন, ম্যানেজার ও ক্লায়েন্ট অ্যাকাউন্টস
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" /> নতুন ইউজার যুক্ত করুন
                </button>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformUsers.map((u, i) => (
                  <div key={i} className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{u.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{u.phone}</p>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          u.role === "super_admin"
                            ? "bg-rose-950/80 text-rose-400 border-rose-800/60"
                            : u.role === "admin"
                            ? "bg-indigo-950/80 text-indigo-400 border-indigo-800/60"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs">
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>

                      {u.phone !== "+880 1850290529" && (
                        <button
                          onClick={() => handleDeleteUser(u.phone, u.name)}
                          className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 font-semibold opacity-80 hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add User Modal */}
              {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" /> নতুন ইউজার যোগ করুন
                      </h3>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddUser} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">নাম (Full Name)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tanvir Ahmed"
                          value={newUserData.name}
                          onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">ফোন নম্বর (Phone)</label>
                        <input
                          type="text"
                          required
                          placeholder="01850290529"
                          value={newUserData.phone}
                          onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">রোল (Role)</label>
                        <select
                          value={newUserData.role}
                          onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="client">Client / Partner</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Administrator</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">পিন (Security PIN)</label>
                        <input
                          type="password"
                          required
                          maxLength={6}
                          value={newUserData.pin}
                          onChange={(e) => setNewUserData({ ...newUserData, pin: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                        >
                          সেভ করুন
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROPOSAL INBOX */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-emerald-400" /> কাস্টমার ইনবক্স ও প্রস্তাবনা সাবমিশন
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Liku Media ওয়েবসাইট থেকে ক্লায়েন্টদের প্রেরিত তথ্য ও কাজ সংক্রান্ত মেসেজসমূহ
                </p>
              </div>

              {inboxMessages.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 text-xs">
                  কোনো মেসেজ পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-4">
                  {inboxMessages.map((msg, i) => (
                    <div key={msg.id || i} className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-white">{msg.name || "Anonymous Client"}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                            {msg.phone && <span className="flex items-center gap-1 font-mono"><Phone className="w-3.5 h-3.5" /> {msg.phone}</span>}
                            {msg.email && <span className="flex items-center gap-1 font-mono"><Mail className="w-3.5 h-3.5" /> {msg.email}</span>}
                            {msg.service && <span className="text-indigo-400 font-semibold">• সার্ভিস: {msg.service}</span>}
                            {msg.budget && <span className="text-emerald-400 font-semibold">• বাজেট: ৳{msg.budget}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString("bn-BD") : "Recent"}
                          </span>
                          {msg.id && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl text-xs text-slate-200 leading-relaxed font-sans border border-slate-800/60 whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
