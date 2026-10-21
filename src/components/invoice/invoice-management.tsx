"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/components/img/likumedia-logo.svg";
import { LIKU_LOGO_BASE64 } from "@/lib/logo-base64";
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  DocumentType,
  DEFAULT_COMPANY,
  DEFAULT_TERMS,
  DEFAULT_CHALLAN_TERMS,
  DEFAULT_PAYMENT_DETAILS,
  formatCurrency,
  generateInvoiceNumber,
  generateChallanNumber,
  calculateInvoiceTotals,
} from "@/lib/invoice";
import { printInvoicePdf } from "@/lib/invoice-pdf";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  DollarSign,
  Send,
  Download,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  HelpCircle,
  Share2,
  ExternalLink,
  Sliders,
  Wallet,
  Truck,
  Receipt,
  PlusCircle,
  ArrowDownCircle,
} from "lucide-react";

interface InvoiceManagementProps {
  platformUsers?: any[];
  userRole?: string;
}

const COMMON_SERVICES = [
  { description: "Custom Website Design & Development", defaultPrice: 25000 },
  { description: "SMS Gateway Integration & API Setup", defaultPrice: 5000 },
  { description: "Multi-Tenant Bulk SMS Balance Recharge", defaultPrice: 1000 },
  { description: "E-Commerce Web Portal with Payment Gateway", defaultPrice: 45000 },
  { description: "Domain Registration & Cloud SSD Hosting (1 Year)", defaultPrice: 4500 },
  { description: "UI/UX Mobile App & Dashboard Design", defaultPrice: 15000 },
  { description: "Search Engine Optimization (SEO) & Marketing Campaign", defaultPrice: 10000 },
  { description: "Custom Software Engineering & Maintenance Support", defaultPrice: 20000 },
];

export function InvoiceManagement({ platformUsers = [], userRole = "super_admin" }: InvoiceManagementProps) {
  // Invoices List & Loading
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [docTypeFilter, setDocTypeFilter] = useState<"all" | "invoice" | "challan">("all");
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Copy shareable public link
  const copyPublicInvoiceLink = (inv: Invoice) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/invoice/${inv.id || inv.invoiceNumber}`;
      navigator.clipboard.writeText(url);
      setCopiedInvoiceId(inv.id);
      setToastMessage(`কাস্টমার শেয়ারেবল লিংক কপি হয়েছে! (${inv.invoiceNumber})`);
      setTimeout(() => {
        setCopiedInvoiceId(null);
        setToastMessage(null);
      }, 3000);
    }
  };

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Add Money Modal State (অ্যাড মানি অপশন)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneySelectedInvoiceId, setAddMoneySelectedInvoiceId] = useState<string>("");
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyPaymentMethod, setAddMoneyPaymentMethod] = useState("bKash");
  const [addMoneyTrxId, setAddMoneyTrxId] = useState("");
  const [addMoneyNote, setAddMoneyNote] = useState("");
  const [isSubmittingAddMoney, setIsSubmittingAddMoney] = useState(false);

  // Quick Payment Modal (legacy helper)
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");

  // SMS Notice Modal
  const [smsModalInvoice, setSmsModalInvoice] = useState<Invoice | null>(null);
  const [copiedSms, setCopiedSms] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Invoice>({
    id: "",
    type: "invoice",
    invoiceNumber: "",
    title: "Software & Digital Media Service Invoice",
    createdAt: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "pending",
    currency: "BDT",
    company: { ...DEFAULT_COMPANY },
    client: {
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
    },
    items: [
      {
        id: "item_1",
        description: "Website Design & Development",
        quantity: 1,
        unitPrice: 25000,
        amount: 25000,
      },
    ],
    subtotal: 25000,
    discountType: "fixed",
    discountValue: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 25000,
    paidAmount: 0,
    dueAmount: 25000,
    paymentMethod: "bKash / Nagad / Bank Transfer",
    paymentDetails: DEFAULT_PAYMENT_DETAILS,
    notes: "Thank you for partnering with Liku Media.",
    terms: DEFAULT_TERMS,
  });

  const getLogoUrl = () => {
    return LIKU_LOGO_BASE64;
  };

  // Fetch Invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/invoices");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInvoices(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Recalculate totals
  const updateTotals = (
    items: InvoiceItem[],
    discountType: "percent" | "fixed",
    discountValue: number,
    taxPercent: number,
    paidAmount: number
  ) => {
    const totals = calculateInvoiceTotals(items, discountType, discountValue, taxPercent, paidAmount);
    setFormData((prev) => ({
      ...prev,
      items,
      discountType,
      discountValue,
      taxPercent,
      paidAmount: totals.paidAmount,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      dueAmount: totals.dueAmount,
      status: totals.dueAmount === 0 ? "paid" : prev.status === "paid" ? "pending" : prev.status,
    }));
  };

  // Open Create Invoice Modal
  const handleOpenCreate = () => {
    const invCount = invoices.filter(
      (i) => (!i.type || i.type === "invoice") && !i.invoiceNumber.startsWith("CH-")
    ).length;
    const invNum = generateInvoiceNumber(invCount);
    const initialItems: InvoiceItem[] = [
      {
        id: `item_${Date.now()}`,
        description: "Website Development & Cloud Setup",
        quantity: 1,
        unitPrice: 20000,
        amount: 20000,
      },
    ];
    const totals = calculateInvoiceTotals(initialItems, "fixed", 0, 0, 0);

    setFormData({
      id: `inv_${Date.now()}`,
      type: "invoice",
      invoiceNumber: invNum,
      title: "Software & Digital Media Service Invoice",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      currency: "BDT",
      company: { ...DEFAULT_COMPANY },
      client: {
        name: "",
        company: "",
        phone: "",
        email: "",
        address: "",
      },
      items: initialItems,
      subtotal: totals.subtotal,
      discountType: "fixed",
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: totals.total,
      paidAmount: 0,
      dueAmount: totals.dueAmount,
      paymentMethod: "bKash / Nagad / Bank Transfer",
      paymentDetails: DEFAULT_PAYMENT_DETAILS,
      notes: "Thank you for partnering with Liku Media.",
      terms: DEFAULT_TERMS,
    });
    setModalMode("create");
    setShowModal(true);
  };

  // Open Create Challan Modal (চালান বানানোর বাটন)
  const handleOpenCreateChallan = () => {
    const challanCount = invoices.filter(
      (i) => i.type === "challan" || i.invoiceNumber.startsWith("CH-")
    ).length;
    const chNum = generateChallanNumber(challanCount);
    const initialItems: InvoiceItem[] = [
      {
        id: `item_${Date.now()}`,
        description: "পণ্য বা সার্ভিসের ডেলিভারি আইটেম",
        quantity: 1,
        unitPrice: 5000,
        amount: 5000,
      },
    ];
    const totals = calculateInvoiceTotals(initialItems, "fixed", 0, 0, 0);

    setFormData({
      id: `ch_${Date.now()}`,
      type: "challan",
      invoiceNumber: chNum,
      title: "পণ্য ও ডেলিভারি চালান (Delivery Challan)",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      currency: "BDT",
      company: { ...DEFAULT_COMPANY },
      client: {
        name: "",
        company: "",
        phone: "",
        email: "",
        address: "",
      },
      items: initialItems,
      subtotal: totals.subtotal,
      discountType: "fixed",
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: totals.total,
      paidAmount: 0,
      dueAmount: totals.dueAmount,
      paymentMethod: "ক্যাশ অন ডেলিভারি / বিকাশ",
      paymentDetails: DEFAULT_PAYMENT_DETAILS,
      notes: "পণ্য ও মালামাল সন্তোষজনক অবস্থায় হস্তান্তর করা হয়েছে।",
      terms: DEFAULT_CHALLAN_TERMS,
    });
    setModalMode("create");
    setShowModal(true);
  };

  // Switch Document Type inside split-view editor
  const handleSwitchDocType = (newType: "invoice" | "challan") => {
    if (formData.type === newType) return;
    if (newType === "challan") {
      const challanCount = invoices.filter(
        (i) => i.type === "challan" || i.invoiceNumber.startsWith("CH-")
      ).length;
      const chNum = formData.invoiceNumber.startsWith("LM-")
        ? generateChallanNumber(challanCount)
        : formData.invoiceNumber;
      setFormData((prev) => ({
        ...prev,
        type: "challan",
        invoiceNumber: chNum,
        title:
          prev.title.includes("Software") || prev.title.includes("Service Invoice")
            ? "পণ্য ও ডেলিভারি চালান (Delivery Challan)"
            : prev.title,
        terms: prev.terms === DEFAULT_TERMS ? DEFAULT_CHALLAN_TERMS : prev.terms,
        paymentMethod:
          prev.paymentMethod === "bKash / Nagad / Bank Transfer"
            ? "ক্যাশ অন ডেলিভারি / বিকাশ"
            : prev.paymentMethod,
      }));
    } else {
      const invCount = invoices.filter(
        (i) => (!i.type || i.type === "invoice") && !i.invoiceNumber.startsWith("CH-")
      ).length;
      const invNum = formData.invoiceNumber.startsWith("CH-")
        ? generateInvoiceNumber(invCount)
        : formData.invoiceNumber;
      setFormData((prev) => ({
        ...prev,
        type: "invoice",
        invoiceNumber: invNum,
        title: prev.title.includes("চালান")
          ? "Software & Digital Media Service Invoice"
          : prev.title,
        terms: prev.terms === DEFAULT_CHALLAN_TERMS ? DEFAULT_TERMS : prev.terms,
        paymentMethod:
          prev.paymentMethod === "ক্যাশ অন ডেলিভারি / বিকাশ"
            ? "bKash / Nagad / Bank Transfer"
            : prev.paymentMethod,
      }));
    }
  };

  // Open Add Money Modal (অ্যাড মানি অপশন)
  const handleOpenAddMoney = (inv?: Invoice) => {
    if (inv) {
      setAddMoneySelectedInvoiceId(inv.id);
      setAddMoneyAmount(inv.dueAmount > 0 ? inv.dueAmount.toString() : "");
    } else {
      const firstDue = invoices.find((i) => (i.dueAmount || 0) > 0);
      if (firstDue) {
        setAddMoneySelectedInvoiceId(firstDue.id);
        setAddMoneyAmount(firstDue.dueAmount.toString());
      } else if (invoices.length > 0) {
        setAddMoneySelectedInvoiceId(invoices[0].id);
        setAddMoneyAmount("");
      } else {
        setAddMoneySelectedInvoiceId("");
        setAddMoneyAmount("");
      }
    }
    setAddMoneyPaymentMethod("bKash");
    setAddMoneyTrxId("");
    setAddMoneyNote("");
    setShowAddMoneyModal(true);
  };

  // Confirm Add Money (অ্যাড মানি সেভ)
  const handleConfirmAddMoney = async () => {
    if (!addMoneySelectedInvoiceId) {
      alert("অনুগ্রহ করে একটি ইনভয়েস বা চালান নির্বাচন করুন।");
      return;
    }
    const amount = Number(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("সঠিক অ্যাড মানির পরিমাণ (টাকা) দিন।");
      return;
    }

    setIsSubmittingAddMoney(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addMoneySelectedInvoiceId,
          addAmount: amount,
          paymentMethod: addMoneyPaymentMethod,
          trxId: addMoneyTrxId.trim(),
          note: addMoneyNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setInvoices((prev) =>
          prev.map((item) => (item.id === addMoneySelectedInvoiceId ? data.data : item))
        );
        setShowAddMoneyModal(false);
        setToastMessage(`🎉 ৳${amount.toLocaleString()} সফলভাবে অ্যাড করা হয়েছে! (#${data.data.invoiceNumber})`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("অ্যাড মানি ব্যর্থ হয়েছে: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("অ্যাড মানি সম্পন্ন করা যায়নি।");
    } finally {
      setIsSubmittingAddMoney(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (inv: Invoice) => {
    setFormData({ ...inv });
    setModalMode("edit");
    setShowModal(true);
  };

  // Duplicate Invoice
  const handleDuplicate = (inv: Invoice) => {
    const newInvNum = generateInvoiceNumber(invoices.length);
    const cloned: Invoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      invoiceNumber: newInvNum,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      paidAmount: 0,
      dueAmount: inv.total,
    };
    setFormData(cloned);
    setModalMode("create");
    setShowModal(true);
  };

  // Add Item to Line Items
  const handleAddItem = (preset?: { description: string; defaultPrice: number }) => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      description: preset ? preset.description : "New Service Item",
      quantity: 1,
      unitPrice: preset ? preset.defaultPrice : 1000,
      amount: preset ? preset.defaultPrice : 1000,
    };
    const newItems = [...formData.items, newItem];
    updateTotals(newItems, formData.discountType, formData.discountValue, formData.taxPercent, formData.paidAmount);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      alert("কমপক্ষে একটি আইটেম থাকা আবশ্যক।");
      return;
    }
    const newItems = formData.items.filter((item) => item.id !== id);
    updateTotals(newItems, formData.discountType, formData.discountValue, formData.taxPercent, formData.paidAmount);
  };

  // Update Item field
  const handleItemChange = (id: string, field: "description" | "quantity" | "unitPrice", value: any) => {
    const newItems = formData.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const q = field === "quantity" ? Number(value) || 0 : item.quantity;
        const p = field === "unitPrice" ? Number(value) || 0 : item.unitPrice;
        updated.amount = Math.round(q * p * 100) / 100;
        return updated;
      }
      return item;
    });
    updateTotals(newItems, formData.discountType, formData.discountValue, formData.taxPercent, formData.paidAmount);
  };

  // Save Invoice
  const handleSaveInvoice = async (andPrint = false) => {
    if (!formData.invoiceNumber.trim()) {
      alert("অনুগ্রহ করে ইনভয়েস নম্বর প্রদান করুন।");
      return;
    }
    if (!formData.client.name.trim()) {
      alert("অনুগ্রহ করে ক্লায়েন্টের নাম প্রদান করুন।");
      return;
    }

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save");
      }

      await fetchInvoices();
      setShowModal(false);

      if (andPrint) {
        printInvoicePdf(formData, getLogoUrl());
      }
    } catch (err: any) {
      alert("ইনভয়েস সংরক্ষণে ত্রুটি: " + err.message);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id: string, invNum: string) => {
    if (!confirm(`আপনি কি সত্যিই ইনভয়েস #${invNum} মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/admin/invoices?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("ডিলিট করতে ব্যর্থ: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("ডিলিট করা যায়নি।");
    }
  };

  // Record Quick Payment
  const handleRecordPayment = async () => {
    if (!paymentModalInvoice) return;
    const amount = Number(paymentAmountInput);
    if (isNaN(amount) || amount < 0) {
      alert("সঠিক টাকার পরিমাণ দিন।");
      return;
    }

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentModalInvoice.id,
          paidAmount: amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.map((item) => (item.id === paymentModalInvoice.id ? data.data : item)));
        setPaymentModalInvoice(null);
        setPaymentAmountInput("");
      }
    } catch (err) {
      alert("পেমেন্ট আপডেট ব্যর্থ হয়েছে।");
    }
  };

  // Autofill client from users list
  const handleSelectClientFromUsers = (phone: string) => {
    const found = platformUsers.find((u) => u.phone === phone);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        client: {
          ...prev.client,
          name: found.name || prev.client.name,
          phone: found.phone || prev.client.phone,
        },
      }));
    }
  };

  // Generate SMS text with customer invoice link
  const getSmsMessageText = (inv: Invoice) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://liku.media";
    const link = `${origin}/invoice/${inv.id || inv.invoiceNumber}`;
    const isChallan = inv.type === "challan" || inv.invoiceNumber.startsWith("CH-");
    const docWord = isChallan ? "চালান" : "ইনভয়েস";
    return `প্রিয় ${inv.client.name || "গ্রাহক"}, Liku Media থেকে আপনার ${docWord} #${inv.invoiceNumber} প্রস্তুত হয়েছে। মোট: ${formatCurrency(inv.total, inv.currency)}, বকেয়া: ${formatCurrency(inv.dueAmount, inv.currency)}। ${docWord} দেখতে ও ডাউনলোড করতে ক্লিক করুন: ${link} । বিকাশ/নগদ: 01850290529। ধন্যবাদ!`;
  };

  // Computed Metrics
  const totalInvoicesCount = invoices.length;
  const totalBilled = invoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalDue = invoices.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.client.name.toLowerCase().includes(q) ||
      (inv.client.phone && inv.client.phone.includes(q)) ||
      (inv.client.company && inv.client.company.toLowerCase().includes(q));

    const isChallan =
      inv.type === "challan" ||
      inv.invoiceNumber.startsWith("CH-") ||
      inv.title?.toLowerCase().includes("challan") ||
      inv.title?.includes("চালান");

    const matchDocType =
      docTypeFilter === "all"
        ? true
        : docTypeFilter === "challan"
        ? isChallan
        : !isChallan;

    const matchStatus = statusFilter === "all" ? true : inv.status === statusFilter;
    return matchSearch && matchDocType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="Liku Media" className="h-8 w-auto object-contain" priority />
            <h2 className="text-xl font-bold text-white tracking-tight">ইনভয়েস ও চালান ম্যানেজার (Billing Studio)</h2>
          </div>
          <p className="text-xs text-slate-400">
            ক্লায়েন্টদের জন্য ইনভয়েস ও ডেলিভারি চালান তৈরি, লাইভ রিয়েল-টাইম প্রিভিউ এবং অ্যাড মানি কালেকশন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchInvoices}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-rose-400" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          {/* অ্যাড মানি বাটন */}
          <button
            onClick={() => handleOpenAddMoney()}
            className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 shrink-0"
            title="টাকা অ্যাড বা পেমেন্ট রেকর্ড করুন"
          >
            <Wallet className="w-4 h-4" /> অ্যাড মানি (Add Money)
          </button>

          {/* চালান বানানোর বাটন */}
          <button
            onClick={handleOpenCreateChallan}
            className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-600/30 shrink-0"
            title="নতুন ডেলিভারি চালান তৈরি করুন"
          >
            <Truck className="w-4 h-4" /> চালান তৈরি করুন
          </button>

          {/* নতুন ইনভয়েস বাটন */}
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-rose-600/30 shrink-0"
            title="নতুন সার্ভিস ইনভয়েস তৈরি করুন"
          >
            <Plus className="w-4 h-4" /> নতুন ইনভয়েস
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">মোট রেকর্ড (ডকুমেন্ট)</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-3 font-mono">{totalInvoicesCount} টি</div>
          <div className="text-[11px] text-slate-400 mt-1">সর্বমোট ইনভয়েস ও চালান রেকর্ড</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">মোট বিল (Invoiced)</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-400 mt-3 font-mono">{formatCurrency(totalBilled)}</div>
          <div className="text-[11px] text-slate-400 mt-1">নির্ধারিত সর্বমোট বিল ও মূল্য</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">পরিশোধিত / অ্যাড মানি</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-3 font-mono">{formatCurrency(totalPaid)}</div>
          <div className="text-[11px] text-slate-400 mt-1">জমা হওয়া মোট ফান্ড ও কালেকশন</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">মোট বকেয়া (Due Balance)</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-3 font-mono">{formatCurrency(totalDue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">আদায়যোগ্য পাওনা টাকা</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ইনভয়েস বা চালান নম্বর, ক্লায়েন্টের নাম বা ফোন লিখে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Document Type Selector Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDocTypeFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                docTypeFilter === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              সব ধরন
            </button>
            <button
              onClick={() => setDocTypeFilter("invoice")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                docTypeFilter === "invoice"
                  ? "bg-rose-950/90 text-rose-300 border border-rose-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3 h-3" /> ইনভয়েস
            </button>
            <button
              onClick={() => setDocTypeFilter("challan")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                docTypeFilter === "challan"
                  ? "bg-cyan-950/90 text-cyan-300 border border-cyan-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Truck className="w-3 h-3" /> চালান
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "সব স্ট্যাটাস" },
              { id: "paid", label: "Paid" },
              { id: "pending", label: "Pending" },
              { id: "overdue", label: "Overdue" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
            <span>ইনভয়েস ডেটা লোড হচ্ছে...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">কোনো ইনভয়েস পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? "আপনার সার্চের সাথে মিলে এমন কোনো ইনভয়েস নেই।" : "প্রথম ইনভয়েস তৈরি করতে নিচের বাটনে ক্লিক করুন।"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenCreate}
                className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> নতুন ইনভয়েস তৈরি করুন
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">ডকুমেন্ট ও তারিখ</th>
                  <th className="py-3.5 px-4">ক্লায়েন্টের বিবরণ</th>
                  <th className="py-3.5 px-4">মোট বিল</th>
                  <th className="py-3.5 px-4">পরিশোধ ও বকেয়া</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === "paid";
                  const isOverdue = inv.status === "overdue";
                  const isPending = inv.status === "pending";
                  const isChallan =
                    inv.type === "challan" ||
                    inv.invoiceNumber.startsWith("CH-") ||
                    inv.title?.toLowerCase().includes("challan") ||
                    inv.title?.includes("চালান");

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition group">
                      {/* Invoice/Challan No, Type & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white group-hover:text-rose-400 transition flex items-center gap-2">
                          <span>#{inv.invoiceNumber}</span>
                          {isChallan ? (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                              চালান
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-950/80 text-rose-400 border border-rose-900/60">
                              ইনভয়েস
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>ইস্যু: {inv.date}</span>
                          <span>•</span>
                          <span className={isOverdue ? "text-rose-400 font-semibold" : ""}>শেষ: {inv.dueDate}</span>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{inv.client.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {inv.client.phone && <span className="font-mono">{inv.client.phone}</span>}
                          {inv.client.company && <span>• {inv.client.company}</span>}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>

                      {/* Paid & Due */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-400 font-semibold text-[11px]">
                          পরিশোধ: {formatCurrency(inv.paidAmount, inv.currency)}
                        </div>
                        <div
                          className={`font-mono text-[11px] mt-0.5 font-bold ${
                            inv.dueAmount > 0 ? "text-rose-400" : "text-slate-400"
                          }`}
                        >
                          বকেয়া: {formatCurrency(inv.dueAmount, inv.currency)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            isPaid
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                              : isPending
                              ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                              : isOverdue
                              ? "bg-rose-950/80 text-rose-400 border-rose-800/80"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {isPaid ? "PAID" : isPending ? "PENDING" : isOverdue ? "OVERDUE" : inv.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Button */}
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="প্রিভিউ দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Share Public Link */}
                          <button
                            onClick={() => copyPublicInvoiceLink(inv)}
                            className="p-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/80 text-indigo-300 rounded-lg transition"
                            title="কাস্টমার শেয়ার লিংক কপি করুন"
                          >
                            {copiedInvoiceId === inv.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Open Public Page */}
                          <a
                            href={`/invoice/${inv.id || inv.invoiceNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="কাস্টমার ভিউ পেজ খুলুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Print PDF Button */}
                          <button
                            onClick={() => printInvoicePdf(inv, getLogoUrl())}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg transition"
                            title="প্রিন্ট / PDF ডাউনলোড"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Send SMS Notice */}
                          <button
                            onClick={() => {
                              setSmsModalInvoice(inv);
                              setCopiedSms(false);
                            }}
                            className="p-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-300 rounded-lg transition"
                            title="SMS নোটিশ কপি / পাঠান"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Add Money / Quick Payment Button */}
                          <button
                            onClick={() => handleOpenAddMoney(inv)}
                            className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 rounded-lg transition"
                            title="অ্যাড মানি / পেমেন্ট কালেকশন"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="এডিট করুন"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicate(inv)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            title="ক্লোন / ডুপ্লিকেট"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SPLIT-VIEW INVOICE STUDIO (বামপাশে ইনপুট, ডানপাশে লাইভ প্রিভিউ ও লোগো) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[96vw] 2xl:max-w-[1600px] h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Studio Top Action Bar */}
            <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <Image src={Logo} alt="Liku Media" className="h-7 w-auto object-contain" priority />
                <div className="h-5 w-px bg-slate-800" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {modalMode === "create"
                      ? formData.type === "challan"
                        ? "নতুন চালান স্টুডিও"
                        : "নতুন ইনভয়েস স্টুডিও"
                      : `${formData.type === "challan" ? "চালান" : "ইনভয়েস"} এডিট (#${formData.invoiceNumber})`}
                    <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 border border-rose-800 text-rose-300 font-bold">
                      SPLIT-VIEW STUDIO
                    </span>
                  </h3>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => printInvoicePdf(formData, getLogoUrl())}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  title="প্রিন্ট প্রিভিউ দেখুন"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">প্রিন্ট প্রিভিউ</span>
                </button>

                {formData.invoiceNumber && (
                  <button
                    type="button"
                    onClick={() => copyPublicInvoiceLink(formData)}
                    className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-800"
                    title="কাস্টমার শেয়ার লিংক কপি করুন"
                  >
                    {copiedInvoiceId === formData.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">শেয়ার লিংক</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveInvoice(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition"
                >
                  সেভ করুন
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveInvoice(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> সেভ ও প্রিন্ট PDF
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split View Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 p-4 sm:p-6 overflow-hidden bg-slate-950/40">
              
              {/* ======================================================== */}
              {/* LEFT COLUMN: INPUT FORM (বামপাশের ইনপুট ফিল্ডসমূহ) */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-full bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Edit className="w-4 h-4 text-rose-400" />
                    <span>১. ইনপুট ফর্ম (Data Entry)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">রিয়েল-টাইমে ডানপাশে আপডেট হবে</span>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                  {/* Document Type Switcher (ইনভয়েস বনাম চালান) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-400" /> ডকুমেন্টের ধরন (Document Type):
                    </span>
                    <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSwitchDocType("invoice")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                          formData.type !== "challan"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" /> ইনভয়েস (Invoice)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchDocType("challan")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                          formData.type === "challan"
                            ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" /> চালান (Challan)
                      </button>
                    </div>
                  </div>

                  {/* Meta Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {formData.type === "challan" ? "চালান নম্বর *" : "ইনভয়েস নম্বর *"}
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        ইস্যুর তারিখ
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        শেষ তারিখ (Due)
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        কারেন্সি
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-rose-500"
                      >
                        <option value="BDT">BDT (৳ টাকা)</option>
                        <option value="USD">USD ($ ডলার)</option>
                      </select>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          প্রাপক / ক্লায়েন্টের তথ্য (Client Details)
                        </span>
                      </div>

                      {platformUsers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">ইউজার থেকে আনুন:</span>
                          <select
                            onChange={(e) => handleSelectClientFromUsers(e.target.value)}
                            defaultValue=""
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-500"
                          >
                            <option value="" disabled>
                              -- ইউজার নির্বাচন --
                            </option>
                            {platformUsers.map((u, idx) => (
                              <option key={idx} value={u.phone}>
                                {u.name} ({u.phone})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          ক্লায়েন্টের নাম (Full Name) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tanvir Ahmed"
                          value={formData.client.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client: { ...formData.client, name: e.target.value },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">কোম্পানির নাম (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Media Corp"
                          value={formData.client.company || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client: { ...formData.client, company: e.target.value },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">ফোন নম্বর (Phone) *</label>
                        <input
                          type="text"
                          placeholder="+880 1850290529"
                          value={formData.client.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client: { ...formData.client, phone: e.target.value },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">ইমেইল (Email)</label>
                        <input
                          type="email"
                          placeholder="client@example.com"
                          value={formData.client.email || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client: { ...formData.client, email: e.target.value },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">ঠিকানা (Address)</label>
                        <input
                          type="text"
                          placeholder="Dhap, Rangpur, Bangladesh"
                          value={formData.client.address || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              client: { ...formData.client, address: e.target.value },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Line Items Builder */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          আইটেম ও সার্ভিস তালিকা (Line Items)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">কমন সার্ভিস:</span>
                        <select
                          onChange={(e) => {
                            const index = parseInt(e.target.value);
                            if (!isNaN(index) && COMMON_SERVICES[index]) {
                              handleAddItem(COMMON_SERVICES[index]);
                            }
                            e.target.value = "";
                          }}
                          defaultValue=""
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-500"
                        >
                          <option value="" disabled>
                            -- দ্রুত যোগ করুন --
                          </option>
                          {COMMON_SERVICES.map((s, idx) => (
                            <option key={idx} value={idx}>
                              {s.description} ({formatCurrency(s.defaultPrice)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {formData.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl items-center"
                        >
                          {formData.type === "challan" ? (
                            <>
                              <div className="col-span-8 sm:col-span-9">
                                <input
                                  type="text"
                                  placeholder="পণ্যের বিবরণ / মালামালের নাম..."
                                  value={item.description}
                                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>

                              <div className="col-span-3 sm:col-span-2">
                                <input
                                  type="number"
                                  min={1}
                                  title="পরিমাণ (Qty)"
                                  placeholder="পরিমাণ"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-cyan-500"
                                />
                              </div>

                              <div className="col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
                                  title="আইটেম মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-12 sm:col-span-6">
                                <input
                                  type="text"
                                  placeholder="সার্ভিসের বিবরণ..."
                                  value={item.description}
                                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                                />
                              </div>

                              <div className="col-span-4 sm:col-span-2">
                                <input
                                  type="number"
                                  min={1}
                                  title="পরিমাণ (Qty)"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-rose-500"
                                />
                              </div>

                              <div className="col-span-4 sm:col-span-2">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  title="দর (Unit Price)"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-right focus:outline-none focus:border-rose-500"
                                />
                              </div>

                              <div className="col-span-3 sm:col-span-1 text-right font-mono font-bold text-white text-xs truncate">
                                {formatCurrency(item.amount, formData.currency)}
                              </div>

                              <div className="col-span-1 sm:col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
                                  title="আইটেম মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> নতুন সারি যোগ করুন
                    </button>
                  </div>

                  {/* Calculations & Discounts or Challan Info */}
                  {formData.type === "challan" ? (
                    <div className="bg-cyan-950/30 border border-cyan-800/60 p-4 rounded-xl flex items-center gap-3">
                      <Truck className="w-6 h-6 text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-cyan-200">ডেলিভারি চালান মোড (কোনো দাম বা মূল্য থাকবে না)</div>
                        <div className="text-[11px] text-cyan-300/80 mt-0.5 leading-relaxed">
                          চালানের প্রিন্ট ও ভিউ কপিতে পণ্যের কোনো দর (Unit Price), মোট মূল্য, ছাড় বা বকেয়া প্রদর্শিত হবে না। শুধুমাত্র আইটেমের বিবরণ ও সরবরাহের সংখ্যা থাকবে।
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                        ডিসকাউন্ট, ভ্যাট ও পেমেন্ট হিসাব
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            ছাড় (Discount Type)
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={formData.discountType}
                              onChange={(e) =>
                                updateTotals(
                                  formData.items,
                                  e.target.value as any,
                                  formData.discountValue,
                                  formData.taxPercent,
                                  formData.paidAmount
                                )
                              }
                              className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white w-20"
                            >
                              <option value="fixed">Fixed (৳)</option>
                              <option value="percent">%</option>
                            </select>
                            <input
                              type="number"
                              min={0}
                              value={formData.discountValue}
                              onChange={(e) =>
                                updateTotals(
                                  formData.items,
                                  formData.discountType,
                                  Number(e.target.value) || 0,
                                  formData.taxPercent,
                                  formData.paidAmount
                                )
                              }
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            ভ্যাট / ট্যাক্স (% VAT)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={formData.taxPercent}
                            onChange={(e) =>
                              updateTotals(
                                formData.items,
                                formData.discountType,
                                formData.discountValue,
                                Number(e.target.value) || 0,
                                formData.paidAmount
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                            পরিশোধিত টাকা (Paid ৳)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formData.paidAmount}
                            onChange={(e) =>
                              updateTotals(
                                formData.items,
                                formData.discountType,
                                formData.discountValue,
                                formData.taxPercent,
                                Number(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono text-right font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Methods & Terms */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        পেমেন্ট মাধ্যম
                      </label>
                      <input
                        type="text"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        placeholder="e.g. bKash / Nagad / Bank Transfer"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        পেমেন্ট অ্যাকাউন্ট নির্দেশনা
                      </label>
                      <textarea
                        rows={2}
                        value={formData.paymentDetails}
                        onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        শর্তাবলী (Terms & Conditions)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* RIGHT COLUMN: LIVE REAL-TIME PREVIEW (ডানপাশে লাইভ প্রিভিউ ও লোগো) */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>২. লাইভ ইনভয়েস প্রিভিউ (Live Preview)</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    রিয়েল-টাইম লাইভ
                  </span>
                </div>

                {/* Paper Sheet Preview Container (Compact & Crisp) */}
                <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-950/80 flex justify-center custom-scrollbar">
                  <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-5 sm:p-6 border border-slate-200 w-full max-w-2xl space-y-3.5 self-start text-xs font-sans">
                    {/* Top Header: Logo ONLY on left, Invoice details on right */}
                    <div className="flex items-start justify-between border-b-2 border-slate-200 pb-3">
                      <div className="space-y-1">
                        <div className="logo-box">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={LIKU_LOGO_BASE64}
                            alt="Liku Media"
                            className="h-8 sm:h-9 w-auto object-contain block"
                          />
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formData.company.address} • {formData.company.phone} • {formData.company.email}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-slate-900 uppercase tracking-tight">
                          {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-")
                            ? "CHALLAN (চালান)"
                            : "INVOICE"}
                        </div>
                        <div className="font-mono font-bold text-rose-600 text-xs mt-0.5">
                          #{formData.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1.5 mt-1 font-mono">
                          <span>Date: <strong>{formData.date}</strong></span>
                          <span>•</span>
                          <span>
                            {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-") ? "Delivery: " : "Due: "}
                            <strong>{formData.dueDate}</strong>
                          </span>
                          {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-") ? (
                            <span className="px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] border bg-cyan-100 text-cyan-800 border-cyan-300">
                              চালান / CHALLAN
                            </span>
                          ) : (
                            <span
                              className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] border ${
                                formData.dueAmount === 0
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {formData.dueAmount === 0 ? "PAID" : "PENDING"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compact Client / Billed To Strip */}
                    <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 block">
                          {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-")
                            ? "DELIVERED TO / গ্রহীতা:"
                            : "BILLED TO:"}
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {formData.client.name || "Client Name"}{" "}
                          {formData.client.company && (
                            <span className="text-slate-600 font-normal">• {formData.client.company}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formData.client.phone ? `Phone: ${formData.client.phone}` : ""}
                          {formData.client.email ? ` • Email: ${formData.client.email}` : ""}
                          {formData.client.address ? ` • Address: ${formData.client.address}` : ""}
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-[10px] text-slate-500 shrink-0 border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-")
                            ? "PAYMENT / DISPATCH:"
                            : "PAYMENT METHOD:"}
                        </span>
                        <strong className="text-slate-800 font-semibold">{formData.paymentMethod}</strong>
                      </div>
                    </div>

                    {/* Line Items Table (Modern & Compact) */}
                    {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-") ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold">
                            <th className="py-1.5 px-2.5 rounded-l w-10">#</th>
                            <th className="py-1.5 px-2.5">ITEM / DESCRIPTION (বিবরণ)</th>
                            <th className="py-1.5 px-2.5 text-center rounded-r w-24">QTY (পরিমাণ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {formData.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/60">
                              <td className="py-1.5 px-2.5 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                              <td className="py-1.5 px-2.5 font-semibold text-slate-900 text-xs">{item.description}</td>
                              <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-900 text-xs">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold">
                            <th className="py-1.5 px-2.5 rounded-l">#</th>
                            <th className="py-1.5 px-2.5">ITEM / SERVICE DESCRIPTION</th>
                            <th className="py-1.5 px-2.5 text-center">QTY</th>
                            <th className="py-1.5 px-2.5 text-right">UNIT PRICE</th>
                            <th className="py-1.5 px-2.5 text-right rounded-r">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {formData.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/60">
                              <td className="py-1.5 px-2.5 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                              <td className="py-1.5 px-2.5 font-semibold text-slate-900 text-xs">{item.description}</td>
                              <td className="py-1.5 px-2.5 text-center font-mono text-[11px]">{item.quantity}</td>
                              <td className="py-1.5 px-2.5 text-right font-mono text-[11px]">
                                {formatCurrency(item.unitPrice, formData.currency)}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 text-xs">
                                {formatCurrency(item.amount, formData.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Summary & Totals (Modern & Compact) */}
                    {formData.type === "challan" || formData.invoiceNumber.startsWith("CH-") ? (
                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-1">
                        <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-2.5 rounded-lg text-[10.5px] space-y-1 text-slate-600">
                          <div className="font-bold text-slate-900 uppercase text-[9px] tracking-wider">
                            Delivery & Dispatch Details (সরবরাহের বিবরণ)
                          </div>
                          <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10px]">
                            {formData.paymentDetails || "পণ্য যথাযথভাবে অক্ষত অবস্থায় বুঝে নেওয়ার জন্য অনুরোধ করা হচ্ছে।"}
                          </div>
                        </div>

                        <div className="w-full sm:w-56 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">
                            Total Items / মোট পরিমাণ
                          </span>
                          <div className="text-xl font-black font-mono text-slate-900">
                            {formData.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}{" "}
                            <span className="text-xs font-semibold text-slate-500">টি</span>
                          </div>
                          <div className="text-[9.5px] font-semibold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-2 py-0.5 rounded">
                            ✓ ডেলিভারি চালান (কোনো মূল্য অন্তর্ভুক্ত নয়)
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-1">
                        <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-2.5 rounded-lg text-[10.5px] space-y-1 text-slate-600">
                          <div className="font-bold text-slate-900 uppercase text-[9px] tracking-wider">
                            Payment Instructions
                          </div>
                          <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10px]">
                            {formData.paymentDetails}
                          </div>
                        </div>

                        <div className="w-full sm:w-64 space-y-1 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-mono font-semibold text-slate-900">
                              {formatCurrency(formData.subtotal, formData.currency)}
                            </span>
                          </div>
                          {formData.discountAmount > 0 && (
                            <div className="flex justify-between text-rose-600">
                              <span>Discount {formData.discountType === "percent" ? `(${formData.discountValue}%)` : ""}:</span>
                              <span className="font-mono font-semibold">
                                -{formatCurrency(formData.discountAmount, formData.currency)}
                              </span>
                            </div>
                          )}
                          {formData.taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Tax / VAT ({formData.taxPercent}%):</span>
                              <span className="font-mono font-semibold">
                                +{formatCurrency(formData.taxAmount, formData.currency)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-b border-slate-200 py-1.5">
                            <span>Total Amount:</span>
                            <span className="font-mono text-rose-600">
                              {formatCurrency(formData.total, formData.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                            <span>Amount Paid:</span>
                            <span className="font-mono">{formatCurrency(formData.paidAmount, formData.currency)}</span>
                          </div>
                          <div className="flex justify-between bg-rose-50 border border-rose-200 px-2 py-1 rounded text-rose-900 font-bold text-xs">
                            <span>Balance Due:</span>
                            <span className="font-mono">{formatCurrency(formData.dueAmount, formData.currency)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms, Verification QR & Signature (Modern & Compact) */}
                    <div className="border-t border-slate-200 pt-2.5 flex justify-between items-end text-[9.5px] text-slate-500">
                      <div className="max-w-[340px] leading-relaxed">
                        <strong className="text-slate-700 uppercase">Terms & Conditions:</strong><br />
                        {formData.terms}
                      </div>

                      <div className="flex items-center gap-3">
                        {(formData.type === "challan" || formData.invoiceNumber.startsWith("CH-")) && (
                          <div className="text-left shrink-0">
                            <div className="h-5" />
                            <div className="border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                              Receiver&apos;s Signature (গ্রহীতা)
                            </div>
                            <div className="text-[8.5px] text-slate-400">Date & Seal / সিলমোহর</div>
                          </div>
                        )}

                        <div className="text-center">
                          <div className="border border-slate-200 p-0.5 rounded bg-white inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                                (typeof window !== "undefined" ? window.location.origin : "https://liku.media") +
                                  "/invoice/" +
                                  (formData.id || formData.invoiceNumber)
                              )}`}
                              alt="Verify QR"
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <div className="text-[7.5px] text-slate-400 font-mono mt-0.5">Scan to Verify</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="h-5" />
                          <div className="border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                            Authorized Signature
                          </div>
                          <div className="text-[8.5px] text-slate-400">Liku Media Accounts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW / PREVIEW INVOICE */}
      {/* ======================================================== */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <Image src={Logo} alt="Liku Media" className="h-7 w-auto object-contain" priority />
                <span className="text-sm font-bold text-white">
                  {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")
                    ? "ডেলিভারি চালান প্রিভিউ"
                    : "ইনভয়েস প্রিভিউ"}{" "}
                  (#{previewInvoice.invoiceNumber})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyPublicInvoiceLink(previewInvoice)}
                  className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="কাস্টমার শেয়ার লিংক কপি করুন"
                >
                  {copiedInvoiceId === previewInvoice.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> লিংক কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> শেয়ার লিংক
                    </>
                  )}
                </button>

                <a
                  href={`/invoice/${previewInvoice.id || previewInvoice.invoiceNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition border border-slate-700"
                  title="কাস্টমার পেজ ওপেন করুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => printInvoicePdf(previewInvoice, getLogoUrl())}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট / PDF
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto bg-white text-slate-900 m-4 rounded-xl border border-slate-200 space-y-3.5 text-xs font-sans">
              {/* Header with ONLY Logo */}
              <div className="flex items-start justify-between border-b-2 border-slate-200 pb-3">
                <div className="space-y-1">
                  <div className="logo-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={LIKU_LOGO_BASE64}
                      alt="Liku Media"
                      className="h-8 sm:h-9 w-auto object-contain block"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {previewInvoice.company.address} • {previewInvoice.company.phone} • {previewInvoice.company.email}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")
                      ? "CHALLAN (চালান)"
                      : "INVOICE"}
                  </div>
                  <div className="font-mono font-bold text-rose-600 text-xs mt-0.5">
                    #{previewInvoice.invoiceNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1.5 mt-1 font-mono">
                    <span>Date: <strong>{previewInvoice.date}</strong></span>
                    <span>•</span>
                    <span>
                      {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")
                        ? "Delivery: "
                        : "Due: "}
                      <strong>{previewInvoice.dueDate}</strong>
                    </span>
                    {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-") ? (
                      <span className="px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] border bg-cyan-100 text-cyan-800 border-cyan-300">
                        চালান / CHALLAN
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] border ${
                          previewInvoice.dueAmount === 0
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {previewInvoice.dueAmount === 0 ? "PAID" : "PENDING"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Billed To Strip */}
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 block">
                    {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")
                      ? "DELIVERED TO / গ্রহীতা:"
                      : "BILLED TO:"}
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {previewInvoice.client.name || "Client Name"}{" "}
                    {previewInvoice.client.company && (
                      <span className="text-slate-600 font-normal">• {previewInvoice.client.company}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {previewInvoice.client.phone ? `Phone: ${previewInvoice.client.phone}` : ""}
                    {previewInvoice.client.email ? ` • Email: ${previewInvoice.client.email}` : ""}
                    {previewInvoice.client.address ? ` • Address: ${previewInvoice.client.address}` : ""}
                  </div>
                </div>

                <div className="text-left sm:text-right text-[10px] text-slate-500 shrink-0 border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")
                      ? "PAYMENT / DISPATCH:"
                      : "PAYMENT METHOD:"}
                  </span>
                  <strong className="text-slate-800 font-semibold">{previewInvoice.paymentMethod}</strong>
                </div>
              </div>

              {/* Table (Compact) */}
              {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-") ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold">
                      <th className="py-1.5 px-2.5 rounded-l w-10">#</th>
                      <th className="py-1.5 px-2.5">ITEM / DESCRIPTION (বিবরণ)</th>
                      <th className="py-1.5 px-2.5 text-center rounded-r w-24">QTY (পরিমাণ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2.5 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900 text-xs">{item.description}</td>
                        <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-900 text-xs">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[9.5px] font-bold">
                      <th className="py-1.5 px-2.5 rounded-l">#</th>
                      <th className="py-1.5 px-2.5">ITEM / SERVICE DESCRIPTION</th>
                      <th className="py-1.5 px-2.5 text-center">QTY</th>
                      <th className="py-1.5 px-2.5 text-right">UNIT PRICE</th>
                      <th className="py-1.5 px-2.5 text-right rounded-r">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2.5 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900 text-xs">{item.description}</td>
                        <td className="py-1.5 px-2.5 text-center font-mono text-[11px]">{item.quantity}</td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-[11px]">
                          {formatCurrency(item.unitPrice, previewInvoice.currency)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 text-xs">
                          {formatCurrency(item.amount, previewInvoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Summary & Totals (Compact) */}
              {previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-") ? (
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-1">
                  <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-2.5 rounded-lg text-[10.5px] space-y-1 text-slate-600">
                    <div className="font-bold text-slate-900 uppercase text-[9px] tracking-wider">
                      Delivery & Dispatch Details (সরবরাহের বিবরণ)
                    </div>
                    <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10px]">
                      {previewInvoice.paymentDetails || "পণ্য যথাযথভাবে অক্ষত অবস্থায় বুঝে নেওয়ার জন্য অনুরোধ করা হচ্ছে।"}
                    </div>
                  </div>

                  <div className="w-full sm:w-56 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">
                      Total Items / মোট পরিমাণ
                    </span>
                    <div className="text-xl font-black font-mono text-slate-900">
                      {previewInvoice.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}{" "}
                      <span className="text-xs font-semibold text-slate-500">টি</span>
                    </div>
                    <div className="text-[9.5px] font-semibold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-2 py-0.5 rounded">
                      ✓ ডেলিভারি চালান (কোনো মূল্য অন্তর্ভুক্ত নয়)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-1">
                  <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 p-2.5 rounded-lg text-[10.5px] space-y-1 text-slate-600">
                    <div className="font-bold text-slate-900 uppercase text-[9px] tracking-wider">
                      Payment Instructions
                    </div>
                    <div className="whitespace-pre-wrap font-mono leading-relaxed text-[10px]">
                      {previewInvoice.paymentDetails}
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(previewInvoice.subtotal, previewInvoice.currency)}
                      </span>
                    </div>
                    {previewInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <span className="font-mono font-semibold">
                          -{formatCurrency(previewInvoice.discountAmount, previewInvoice.currency)}
                        </span>
                      </div>
                    )}
                    {previewInvoice.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax / VAT ({previewInvoice.taxPercent}%):</span>
                        <span className="font-mono font-semibold">
                          +{formatCurrency(previewInvoice.taxAmount, previewInvoice.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-b border-slate-200 py-1.5">
                      <span>Total Amount:</span>
                      <span className="font-mono text-rose-600">
                        {formatCurrency(previewInvoice.total, previewInvoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                      <span>Amount Paid:</span>
                      <span className="font-mono">{formatCurrency(previewInvoice.paidAmount, previewInvoice.currency)}</span>
                    </div>
                    <div className="flex justify-between bg-rose-50 border border-rose-200 px-2 py-1 rounded text-rose-900 font-bold text-xs">
                      <span>Balance Due:</span>
                      <span className="font-mono">{formatCurrency(previewInvoice.dueAmount, previewInvoice.currency)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms, Verification QR & Signature (Compact) */}
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-end text-[9.5px] text-slate-500">
                <div className="max-w-[340px] leading-relaxed">
                  <strong className="text-slate-700 uppercase">Terms & Conditions:</strong><br />
                  {previewInvoice.terms}
                </div>

                <div className="flex items-center gap-3">
                  {(previewInvoice.type === "challan" || previewInvoice.invoiceNumber.startsWith("CH-")) && (
                    <div className="text-left shrink-0">
                      <div className="h-5" />
                      <div className="border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                        Receiver&apos;s Signature (গ্রহীতা)
                      </div>
                      <div className="text-[8.5px] text-slate-400">Date & Seal / সিলমোহর</div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="border border-slate-200 p-0.5 rounded bg-white inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : "https://liku.media") +
                            "/invoice/" +
                            (previewInvoice.id || previewInvoice.invoiceNumber)
                        )}`}
                        alt="Verify QR"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="text-[7.5px] text-slate-400 font-mono mt-0.5">Scan to Verify</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="h-5" />
                    <div className="border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                      Authorized Signature
                    </div>
                    <div className="text-[8.5px] text-slate-400">Liku Media Accounts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD MONEY / পেমেন্ট কালেকশন অপশন */}
      {/* ======================================================== */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    অ্যাড মানি অপশন (Add Money)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ইনভয়েস বা চালানের বিপরীতে টাকা যোগ করুন ও ব্যালেন্স সমন্বয় করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Invoice / Challan Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  ইনভয়েস বা চালান নির্বাচন করুন *
                </label>
                <select
                  value={addMoneySelectedInvoiceId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAddMoneySelectedInvoiceId(id);
                    const found = invoices.find((i) => i.id === id);
                    if (found && found.dueAmount > 0) {
                      setAddMoneyAmount(found.dueAmount.toString());
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="" disabled>-- ইনভয়েস বা চালান বাছাই করুন --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.invoiceNumber} - {inv.client.name} {inv.client.company ? `(${inv.client.company})` : ""} | মোট: ৳{inv.total} | বকেয়া: ৳{inv.dueAmount}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Invoice Overview Card */}
              {(() => {
                const selectedInv = invoices.find((i) => i.id === addMoneySelectedInvoiceId);
                if (!selectedInv) return null;
                const isChallan = selectedInv.type === "challan" || selectedInv.invoiceNumber.startsWith("CH-");
                const currentPaid = selectedInv.paidAmount || 0;
                const enteredAmt = Math.max(0, Number(addMoneyAmount) || 0);
                const projectedPaid = Math.min(selectedInv.total, currentPaid + enteredAmt);
                const projectedDue = Math.max(0, selectedInv.total - projectedPaid);

                return (
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          #{selectedInv.invoiceNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                            isChallan
                              ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                              : "bg-rose-950/80 text-rose-400 border border-rose-900/60"
                          }`}
                        >
                          {isChallan ? "চালান" : "ইনভয়েস"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">
                        {selectedInv.client.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
                      <div className="p-2 bg-slate-900 rounded-xl">
                        <div className="text-[10px] text-slate-400">মোট মূল্য</div>
                        <div className="text-xs font-mono font-bold text-white mt-0.5">
                          {formatCurrency(selectedInv.total, selectedInv.currency)}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-xl">
                        <div className="text-[10px] text-slate-400">আগে পরিশোধিত</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          {formatCurrency(selectedInv.paidAmount, selectedInv.currency)}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-xl">
                        <div className="text-[10px] text-slate-400">বর্তমান বকেয়া</div>
                        <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">
                          {formatCurrency(selectedInv.dueAmount, selectedInv.currency)}
                        </div>
                      </div>
                    </div>

                    {enteredAmt > 0 && (
                      <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                        <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          অ্যাড মানির পর নতুন বকেয়া:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            {formatCurrency(projectedDue, selectedInv.currency)}
                          </span>
                          {projectedDue === 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-slate-950">
                              ফুল পেইড
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. Amount Input & Quick Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  অ্যাড মানির পরিমাণ (টাকা ৳) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400 font-mono">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={1}
                    placeholder="যেমন: 5000"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {(() => {
                    const sel = invoices.find((i) => i.id === addMoneySelectedInvoiceId);
                    if (sel && sel.dueAmount > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => setAddMoneyAmount(sel.dueAmount.toString())}
                          className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-bold transition"
                        >
                          সম্পূর্ণ বকেয়া (৳{sel.dueAmount})
                        </button>
                      );
                    }
                    return null;
                  })()}
                  {[500, 1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddMoneyAmount(amt.toString())}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono transition"
                    >
                      +৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  পেমেন্ট মাধ্যম (Payment Method)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: "bKash", label: "বিকাশ" },
                    { id: "Nagad", label: "নগদ" },
                    { id: "Rocket", label: "রকেট" },
                    { id: "Bank Transfer", label: "ব্যাংক" },
                    { id: "Cash", label: "ক্যাশ" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setAddMoneyPaymentMethod(pm.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition ${
                        addMoneyPaymentMethod === pm.id
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. TrxID & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8N7X29TY1"
                    value={addMoneyTrxId}
                    onChange={(e) => setAddMoneyTrxId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    পেমেন্ট নোট / রেফারেন্স
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ব্যক্তিগত বিকাশ নম্বর থেকে প্রাপ্ত"
                    value={addMoneyNote}
                    onChange={(e) => setAddMoneyNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAddMoney}
                  onClick={handleConfirmAddMoney}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmittingAddMoney ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                  অ্যাড মানি নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SMS NOTICE GENERATOR */}
      {/* ======================================================== */}
      {smsModalInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" /> ক্লায়েন্টকে SMS নোটিশ প্রেরণ
              </h3>
              <button onClick={() => setSmsModalInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>প্রাপকের মোবাইল:</span>
                <span className="font-mono text-white font-bold">{smsModalInvoice.client.phone || "No phone"}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">প্রস্তুতকৃত SMS কন্টেন্ট:</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-sans whitespace-pre-wrap leading-relaxed select-all">
                  {getSmsMessageText(smsModalInvoice)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getSmsMessageText(smsModalInvoice));
                    setCopiedSms(true);
                    setTimeout(() => setCopiedSms(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition"
                >
                  {copiedSms ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedSms ? "কপি করা হয়েছে!" : "SMS কপি করুন"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!smsModalInvoice.client.phone) {
                      alert("ক্লায়েন্টের কোনো ফোন নম্বর নেই।");
                      return;
                    }
                    window.open(
                      `https://wa.me/${smsModalInvoice.client.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        getSmsMessageText(smsModalInvoice)
                      )}`,
                      "_blank"
                    );
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp এ পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
