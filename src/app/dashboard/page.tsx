"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/img/likumedia-logo.svg";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, query, where, deleteDoc } from "firebase/firestore";
import { 
  Printer, 
  Globe, 
  CreditCard, 
  LogOut, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  RefreshCw,
  Users,
  Server,
  Activity,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Layers,
  Inbox
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{ phone: string; role: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "print" | "digital" | "billing" | "users" | "logs" | "messages">("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Modal State for Adding User (Super Admin & Admin feature)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", phone: "", role: "client", pin: "123456" });

  // Database lists
  const [platformUsers, setPlatformUsers] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState([
    { time: "19:24:01", event: "Enterprise Catalog backup written", status: "Success" },
    { time: "19:15:32", event: "SSL Handshake audit completed", status: "Success" },
    { time: "18:40:12", event: "Manager Rafat Kabir joined production floor", status: "Info" },
    { time: "18:10:02", event: "API Gateway rate limit check: 0 warnings", status: "Success" },
  ]);

  const [printJobs, setPrintJobs] = useState([
    { id: "JOB-4890", name: "Premium Catalog Run", qty: "15,000 Pcs", status: "In Press", progress: 67, ink: { c: 80, m: 70, y: 90, k: 40 } },
    { id: "JOB-4891", name: "Executive Business Cards", qty: "2,000 Pcs", status: "Finished", progress: 100, ink: { c: 100, m: 100, y: 100, k: 100 } }
  ]);

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
          console.log(`Auto-Migrating user document "${docId}" to phone-keyed ID "${userPhone}"...`);
          
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
      console.error("Failed to load or migrate Firestore users:", err);
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
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      
      // Sort by createdAt timestamp descending
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setInboxMessages(list);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load resources based on user role session
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
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Adjust Ink levels (Manager feature)
  const adjustInk = (jobId: string, color: 'c' | 'm' | 'y' | 'k', amount: number) => {
    setPrintJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          ink: {
            ...job.ink,
            [color]: Math.min(100, Math.max(0, job.ink[color] + amount))
          }
        };
      }
      return job;
    }));
  };

  // Save new user to Firestore database
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

      setSystemLogs(prev => [
        { time: new Date().toTimeString().split(" ")[0], event: `User ${newUserData.name} written to Firestore`, status: "Success" },
        ...prev
      ]);

      await fetchFirestoreUsers();
    } catch (err: any) {
      console.error("Failed to write user to Firestore:", err);
      alert("Error adding user to database: " + (err.message || "Permissions denied"));
    }
    
    setShowAddModal(false);
    setNewUserData({ name: "", phone: "", role: "client", pin: "123456" });
  };

  // Delete user from Firestore database
  const handleDeleteUser = async (phoneToDelete: string, userName: string) => {
    try {
      await deleteDoc(doc(db, "users", phoneToDelete));

      setSystemLogs(prev => [
        { time: new Date().toTimeString().split(" ")[0], event: `Deleted user ${userName} from Firestore`, status: "Warning" },
        ...prev
      ]);

      await fetchFirestoreUsers();
    } catch (err: any) {
      console.error("Failed to delete user from Firestore:", err);
      alert("Error deleting user: " + (err.message || "Permissions denied"));
    }
  };

  // Delete contact message from Firestore
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, "messages", msgId));

      setSystemLogs(prev => [
        { time: new Date().toTimeString().split(" ")[0], event: `Deleted proposal request ${msgId} from Firestore`, status: "Warning" },
        ...prev
      ]);

      await fetchFirestoreMessages();
    } catch (err: any) {
      console.error("Failed to delete message:", err);
      alert("Error deleting request: " + (err.message || "Permissions denied"));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      {/* Background Starry Space Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.06),transparent_60%)] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl relative z-10 sticky top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image 
                src={Logo} 
                alt="Liku Media" 
                className="h-9 w-auto object-contain" 
                priority
              />
            </Link>
            <span className="h-5 w-[1px] bg-white/20 hidden sm:block" />
            
            {/* Role indicator tag */}
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e11d48] bg-[#e11d48]/10 border border-[#e11d48]/20 px-2.5 py-1 rounded hidden sm:block">
              {user.role.replace("_", " ")} Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="p-2 hover:bg-white/5 active:scale-95 transition-all rounded-full"
              title="Refresh Console"
            >
              <RefreshCw className={`size-4 text-neutral-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link 
              href="/login" 
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors py-2 px-3 hover:bg-white/5 rounded-full"
            >
              <span>Logout</span>
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Console Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Console Headline */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e11d48] flex items-center gap-2">
              <Sparkles className="size-3 text-[#eab308]" />
              <span>System Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl mt-2">
              {user.role === "super_admin" && "Super Admin Console"}
              {user.role === "admin" && "Administrator Console"}
              {user.role === "manager" && "Production Manager Console"}
              {user.role === "client" && "Enterprise Partner Workspace"}
            </h1>
            <p className="text-[10px] text-neutral-500 font-light mt-1.5 uppercase tracking-widest">
              Liku Media Cloud Systems • Logged as {user.phone} ({user.role})
            </p>
          </div>

          {/* Action Tabs selector based on Role */}
          <div className="flex bg-neutral-900/50 border border-white/5 p-1 rounded-full w-max flex-wrap gap-1">
            {/* Overview - Shared */}
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                activeTab === "overview" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Overview
            </button>

            {/* Role specific tabs */}
            {(user.role === "super_admin" || user.role === "admin") && (
              <>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeTab === "users" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  User Directory
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeTab === "messages" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Proposal Inbox
                </button>
              </>
            )}

            {(user.role === "super_admin") && (
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                  activeTab === "logs" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                System Logs
              </button>
            )}

            {/* Standard Project Tabs */}
            <button
              onClick={() => setActiveTab("print")}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                activeTab === "print" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
              }`}
            >
              Print Floor
            </button>

            {user.role === "client" && (
              <>
                <button
                  onClick={() => setActiveTab("digital")}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeTab === "digital" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Websites
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeTab === "billing" ? "bg-primary text-primary-foreground shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Ledger
                </button>
              </>
            )}
          </div>
        </div>

        {/* -------------------- OVERVIEW TAB -------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Role Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.role === "super_admin" && (
                <>
                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total System Users</span>
                      <Users className="size-5 text-[#e11d48]" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">{platformUsers.length} Users</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Stored in Cloud Firestore</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Proposal Inbox</span>
                      <Inbox className="size-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">{inboxMessages.length} Requests</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Client messages in Firestore</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Database Engine</span>
                      <Server className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">Firestore DB</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Operational • Latency: 4ms</div>
                    </div>
                  </div>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Proposal Inbox</span>
                      <Inbox className="size-5 text-[#e11d48]" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">{inboxMessages.length} Requests</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Client messages in Firestore</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Design Approvals</span>
                      <CheckCircle2 className="size-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">৪টি পেন্ডিং</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Requires design review</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Enterprise Sales</span>
                      <TrendingUp className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">৳৳৪,৮২০,০০০</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Paid contract summaries</div>
                    </div>
                  </div>
                </>
              )}

              {user.role === "manager" && (
                <>
                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Operational Presses</span>
                      <Printer className="size-5 text-[#e11d48]" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">২ / ৩ সেশন</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Offset Press 1 & 2 active</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">direct CTP Plates</span>
                      <Layers className="size-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">১৬টি প্লেট</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Processed and locked</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Design Approvals</span>
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">৪টি রেডি</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Pending print dispatch</div>
                    </div>
                  </div>
                </>
              )}

              {user.role === "client" && (
                <>
                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Print Production Runs</span>
                      <Printer className="size-5 text-[#e11d48]" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">১টি রানিং</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Premium Catalog (67% Done)</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Web Portals</span>
                      <Globe className="size-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">২টি সোর্স</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Production URL & Staging</div>
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pending Invoices</span>
                      <CreditCard className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-black">৳৫০,০০০</div>
                      <div className="text-[10px] text-neutral-500 font-light uppercase tracking-wider mt-1">Due Date: 2026-07-15</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Split Visual Layout depending on Role */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column depending on role */}
              <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-6">
                {user.role === "super_admin" || user.role === "admin" ? (
                  /* User Directory Preview */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Registered Core Users</h3>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center"
                      >
                        <Plus className="size-3 mr-1" /> Add User
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="flex py-10 justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : (
                        platformUsers.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs">
                            <div className="text-left space-y-1">
                              <div className="font-extrabold text-white">{item.name}</div>
                              <div className="text-[9px] text-neutral-500">{item.phone}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                item.role === "super_admin" ? "bg-red-500/10 text-red-400" :
                                item.role === "admin" ? "bg-amber-500/10 text-amber-400" :
                                item.role === "manager" ? "bg-blue-500/10 text-blue-400" : "bg-neutral-500/10 text-neutral-400"
                              }`}>
                                {item.role.replace("_", " ")}
                              </span>
                              <button 
                                onClick={() => handleDeleteUser(item.phone, item.name)}
                                className="text-neutral-600 hover:text-red-500 transition-colors p-1"
                                title="Delete User"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  /* Client or Manager: Live Print production progress */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Offset Printing Progress</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Live</span>
                    </div>

                    <div className="space-y-6">
                      {printJobs.map((job, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-extrabold uppercase tracking-wide text-white">{job.name}</span>
                              <span className="text-[10px] text-neutral-500 ml-2">({job.qty})</span>
                            </div>
                            <span className="font-bold text-neutral-400">{job.progress}%</span>
                          </div>

                          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#e11d48] to-[#eab308] rounded-full transition-all duration-1000" 
                              style={{ width: `${job.progress}%` }} 
                            />
                          </div>

                          {/* Print ink indicators */}
                          {job.progress < 100 && (
                            <div className="grid grid-cols-4 gap-2 pt-2">
                              {Object.keys(job.ink).map((colorKey) => {
                                const val = (job.ink as any)[colorKey];
                                return (
                                  <div key={colorKey} className="space-y-1">
                                    <div className="text-[8px] font-black uppercase tracking-wider text-neutral-500 text-center uppercase">{colorKey}</div>
                                    <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${
                                          colorKey === 'c' ? 'bg-cyan-400' :
                                          colorKey === 'm' ? 'bg-pink-500' :
                                          colorKey === 'y' ? 'bg-yellow-400' : 'bg-white'
                                        }`} 
                                        style={{ width: `${val}%` }} 
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Column depending on role */}
              <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-6">
                {user.role === "super_admin" ? (
                  /* Event Logs Preview for Super Admin */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Security & Audit Event Logs</h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Live logs</span>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {systemLogs.map((log, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] font-mono flex items-center justify-between">
                          <div className="text-left space-y-1">
                            <span className="text-[#eab308] mr-2">[{log.time}]</span>
                            <span className="text-neutral-300">{log.event}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            log.status === "Success" ? "bg-emerald-500/10 text-emerald-400" :
                            log.status === "Warning" ? "bg-red-500/10 text-red-400" : "bg-neutral-500/10 text-neutral-400"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : user.role === "manager" ? (
                  /* Manager: Direct CTP Plate controls */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Ink Flow Calibration Controls</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500"><Sliders className="size-3.5 inline mr-1" /> Calibration</span>
                    </div>

                    <div className="space-y-6 text-left">
                      {printJobs.filter(j => j.progress < 100).map((job, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="text-xs font-bold text-white uppercase tracking-wider">{job.name} (Ink Pumps)</div>
                          
                          <div className="space-y-3 pt-2">
                            {(['c', 'm', 'y', 'k'] as const).map((color) => (
                              <div key={color} className="flex items-center justify-between text-xs">
                                <span className="font-extrabold uppercase w-12 text-neutral-400">
                                  {color === 'c' && 'Cyan'}
                                  {color === 'm' && 'Magenta'}
                                  {color === 'y' && 'Yellow'}
                                  {color === 'k' && 'Black'}
                                </span>
                                <div className="flex items-center space-x-3">
                                  <button 
                                    onClick={() => adjustInk(job.id, color, -5)}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-neutral-300"
                                  >
                                    -5%
                                  </button>
                                  <span className="font-mono text-white min-w-[36px] text-center">{(job.ink as any)[color]}%</span>
                                  <button 
                                    onClick={() => adjustInk(job.id, color, 5)}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-neutral-300"
                                  >
                                    +5%
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Admin or Client: Active system deployments */
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Web Portal Cloud Deployments</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center">
                        <CheckCircle2 className="size-3 mr-1" /> Connected
                      </span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "Enterprise Next.js Web Portal", branch: "main", commit: "fe45a90", status: "Active", url: "https://liku.media" },
                        { name: "Client ERP System", branch: "staging", commit: "a89d123", status: "Building", url: "https://staging.liku.media" }
                      ].map((project, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="space-y-1 text-left">
                            <div className="text-xs font-bold text-white uppercase tracking-wider">{project.name}</div>
                            <div className="text-[9px] text-neutral-500">
                              Branch: <span className="text-neutral-400">{project.branch}</span> • Commit: <span className="text-neutral-400 font-mono">{project.commit}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              project.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {project.status}
                            </span>
                            <a 
                              href={project.url} 
                              target="_blank" 
                              className="p-1 hover:bg-white/10 rounded transition-all text-neutral-400 hover:text-white"
                            >
                              <ArrowUpRight className="size-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------- USER DIRECTORY TAB -------------------- */}
        {activeTab === "users" && (
          <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Full User Management Directory</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center h-10"
              >
                <Plus className="size-4 mr-1.5" /> Add New User
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingUsers ? (
                <div className="flex py-10 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                platformUsers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-white/5 p-3 text-neutral-400">
                        <Users className="size-5" />
                      </div>
                      <div className="text-left space-y-1">
                        <div className="text-sm font-extrabold text-white">{item.name}</div>
                        <div className="text-[10px] text-neutral-500">{item.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.role === "super_admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        item.role === "admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        item.role === "manager" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-800"
                      }`}>
                        {item.role.replace("_", " ")}
                      </span>
                      <button 
                        onClick={() => handleDeleteUser(item.phone, item.name)}
                        className="text-neutral-500 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full"
                        title="Delete User"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -------------------- PROPOSAL INBOX TAB -------------------- */}
        {activeTab === "messages" && (
          <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Client Proposal Requests & Messages</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {inboxMessages.length} Requests
              </span>
            </div>

            <div className="space-y-6">
              {isLoadingMessages ? (
                <div className="flex py-10 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : inboxMessages.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-10">No proposal requests received yet.</p>
              ) : (
                inboxMessages.map((msg, idx) => (
                  <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <div className="text-[9px] font-mono text-neutral-500">{msg.id} • {new Date(msg.createdAt).toLocaleString()}</div>
                        <h4 className="text-base font-extrabold text-white mt-1">{msg.name}</h4>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{msg.company !== "N/A" ? `Company: ${msg.company}` : "Individual Client"}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`https://wa.me/${msg.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          className="px-3.5 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          WhatsApp Reply
                        </a>
                        <a 
                          href={`mailto:${msg.email}`}
                          className="px-3.5 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Email
                        </a>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                          title="Delete Request"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Message */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Phone</span>
                        <span className="text-xs text-neutral-300 mt-0.5 block">{msg.phone}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Email</span>
                        <span className="text-xs text-neutral-300 mt-0.5 block">{msg.email}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Services Requested</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {msg.services && msg.services.length > 0 ? (
                            msg.services.map((srv: string, sIdx: number) => (
                              <span key={sIdx} className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-neutral-300">
                                {srv}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-neutral-500">None selected</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold block">Project Description</span>
                        <p className="text-xs text-neutral-300 leading-relaxed mt-1 p-3 bg-white/[0.01] border border-white/5 rounded-xl whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -------------------- SYSTEM LOGS TAB -------------------- */}
        {activeTab === "logs" && (
          <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Full Event Logs & Cloud Security Audits</h3>
              <Activity className="size-5 text-neutral-400" />
            </div>

            <div className="space-y-4">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-mono flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <span className="text-[#eab308] mr-2">[{log.time}]</span>
                    <span className="text-neutral-300">{log.event}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                    log.status === "Success" ? "bg-emerald-500/10 text-emerald-400" :
                    log.status === "Warning" ? "bg-red-500/10 text-red-400" : "bg-neutral-500/10 text-neutral-400"
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- PRINT TAB -------------------- */}
        {activeTab === "print" && (
          <div className="rounded-none border border-white/10 bg-white/[0.01] p-8 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">All Print Production Orders</h3>
              <Printer className="size-5 text-neutral-400" />
            </div>

            <div className="space-y-6">
              {printJobs.map((job, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 space-y-4 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{job.id}</div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white mt-1">{job.name}</h4>
                    </div>
                    <span className={`w-max text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      job.status === "Finished" ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Print Volume</span>
                      <span className="font-bold text-white mt-0.5 block">{job.qty}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Colors Config</span>
                      <span className="font-bold text-white mt-0.5 block">CMYK 4-Color Process</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Plate System</span>
                      <span className="font-bold text-white mt-0.5 block">Direct CTP Digital Plates</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Paper Medium</span>
                      <span className="font-bold text-white mt-0.5 block">300 GSM Art Card Matte</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* -------------------- ADD USER MODAL (POPUP) -------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-none w-full max-w-sm relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <h4 className="text-xl font-extrabold uppercase tracking-tight text-white">Create New User</h4>
              <p className="text-[10px] text-neutral-500 font-light">Insert details to store in Firestore database.</p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kabir Hossain"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white outline-none focus:border-primary transition-all duration-200 h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 01700-000000"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white outline-none focus:border-primary transition-all duration-200 h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">PIN Code (6 digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={newUserData.pin}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="e.g. 123456"
                  className="w-full rounded-none border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white outline-none focus:border-primary transition-all duration-200 h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-left">System Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-none border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-all duration-200 h-10"
                >
                  <option value="client">Client (Default)</option>
                  <option value="manager">Production Manager</option>
                  <option value="admin">Administrator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-white/10 hover:bg-white/5 rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary border border-primary text-primary-foreground hover:bg-transparent hover:text-primary rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all h-10"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
