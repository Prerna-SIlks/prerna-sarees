"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DragDropUpload } from "@/components/admin/DragDropUpload";
import { Loader2, ReceiptText, ChevronDown, ChevronRight, Trash2, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function BillManagementPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload & extraction state
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [progressText, setProgressText] = useState("");
  
  // Edit states
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth().toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const supabase = createClient();

  const fetchBills = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('bill_date', { ascending: false });
      
    if (error) {
      toast.error("Failed to load bills");
      console.error(error);
    } else {
      setBills(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // --- EXTRACTION ---
  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setUploadedUrl(urls[0]);
    }
  };

  const handleExtractData = async () => {
    if (!uploadedUrl) return
    setExtracting(true)
    setProgress(0)
    
    try {
      // Show progress steps
      setProgressText('Preparing image...')
      setProgress(20)
      
      // Fetch the image from URL and convert to Base64
      const res = await fetch(uploadedUrl)
      const blob = await res.blob()
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      
      setProgress(40)
      setProgressText('AI is reading your bill...')
      
      const response = await fetch('/api/extract-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: blob.type || 'image/jpeg'
        })
      })
      
      setProgress(80)
      setProgressText('Extracting data...')
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setProgress(100)
      setProgressText('Done!')
      setExtractedData(result.data)
      
      if (result.data.entries.length === 0) {
        toast.warning('No entries found. Please add manually.')
      } else {
        toast.success(result.data.entries.length + ' bill entries extracted!')
      }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(err: any) {
      toast.error('Failed: ' + err.message)
    } finally {
      setExtracting(false)
    }
  }

  const updateEntry = (index: number, field: string, value: string) => {
    const newEntries = [...extractedData.entries];
    newEntries[index][field] = value;
    
    // Auto calculate totals
    const tax = newEntries.reduce((sum, e) => sum + (parseFloat(e.tax) || 0), 0);
    const amount = newEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    setExtractedData({
      ...extractedData,
      entries: newEntries,
      total_tax: Math.round(tax * 100) / 100,
      total_amount: Math.round(amount * 100) / 100,
      total_bills: newEntries.length
    });
  };

  const removeEntry = (index: number) => {
    const newEntries = [...extractedData.entries];
    newEntries.splice(index, 1);
    
    const tax = newEntries.reduce((sum, e) => sum + (parseFloat(e.tax) || 0), 0);
    const amount = newEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    setExtractedData({
      ...extractedData,
      entries: newEntries,
      total_tax: Math.round(tax * 100) / 100,
      total_amount: Math.round(amount * 100) / 100,
      total_bills: newEntries.length
    });
  };

  const addRow = () => {
    const newEntries = [...extractedData.entries, { bill_no: "", tax: 0, discount: 0, amount: 0 }];
    setExtractedData({
      ...extractedData,
      entries: newEntries,
      total_bills: newEntries.length
    });
  };

  const handleSaveBill = async (forceReplace = false) => {
    try {
      setSaving(true);
      const res = await fetch('/api/save-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billData: { ...extractedData, forceReplace },
          imageUrl: uploadedUrl
        })
      });
      
      const result = await res.json();
      
      if (!result.success) {
        if (result.duplicate) {
          if (window.confirm("A bill for this date already exists. Do you want to replace it?")) {
            return handleSaveBill(true);
          }
          return;
        }
        throw new Error(result.error);
      }
      
      toast.success("Bill saved successfully!");
      setExtractedData(null);
      setUploadedUrl(null);
      fetchBills();
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  const deleteBill = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete bill");
    } else {
      toast.success("Bill deleted");
      fetchBills();
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // --- STATS & CHARTS ---
  const now = new Date();
  
  const isToday = (d: string) => new Date(d).toDateString() === now.toDateString();
  const isThisWeek = (d: string) => {
    const date = new Date(d);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return date >= startOfWeek;
  };
  const isThisMonth = (d: string) => {
    const date = new Date(d);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };
  const isThisYear = (d: string) => new Date(d).getFullYear() === now.getFullYear();

  const todayAmount = bills.filter(b => isToday(b.bill_date)).reduce((sum, b) => sum + Number(b.total_amount), 0);
  const weekAmount = bills.filter(b => isThisWeek(b.bill_date)).reduce((sum, b) => sum + Number(b.total_amount), 0);
  const monthAmount = bills.filter(b => isThisMonth(b.bill_date)).reduce((sum, b) => sum + Number(b.total_amount), 0);
  const yearAmount = bills.filter(b => isThisYear(b.bill_date)).reduce((sum, b) => sum + Number(b.total_amount), 0);

  const todayCount = bills.filter(b => isToday(b.bill_date)).length;
  const weekCount = bills.filter(b => isThisWeek(b.bill_date)).length;
  const monthCount = bills.filter(b => isThisMonth(b.bill_date)).length;
  const yearCount = bills.filter(b => isThisYear(b.bill_date)).length;

  // Chart Data: Last 30 Days
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayBill = bills.find(b => b.bill_date === dateStr);
    return {
      date: dateStr.split('-').slice(1).join('/'),
      amount: dayBill ? Number(dayBill.total_amount) : 0
    };
  }).reverse();

  // Chart Data: Monthly
  const monthlyData = [...Array(12)].map((_, i) => {
    const monthBills = bills.filter(b => new Date(b.bill_date).getMonth() === i && new Date(b.bill_date).getFullYear() === parseInt(yearFilter));
    return {
      month: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
      amount: monthBills.reduce((sum, b) => sum + Number(b.total_amount), 0)
    };
  });

  // Top 5 Days
  const topDays = [...bills].sort((a, b) => Number(b.total_amount) - Number(a.total_amount)).slice(0, 5);

  // Filtered Bills for Table
  const filteredBills = bills.filter(b => {
    if (dateFilter && b.bill_date !== dateFilter) return false;
    const date = new Date(b.bill_date);
    if (monthFilter !== "all" && date.getMonth().toString() !== monthFilter) return false;
    if (yearFilter !== "all" && date.getFullYear().toString() !== yearFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-2 flex items-center gap-3">
          <ReceiptText className="h-8 w-8 text-[#C9A84C]" /> Bill Management
        </h1>
        <p className="text-gray-500">Extract, upload, and track physical bills automatically.</p>
      </div>

      {/* --- UPLOAD SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-serif font-semibold text-[#1a1a2e] mb-6 border-b pb-4">Upload Daily Bill Report</h2>
        
        {!extractedData ? (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200">
              <p className="font-bold mb-1">For best accuracy:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Take photo in good lighting</li>
                <li>Keep bill flat, no shadows</li>
                <li>Capture entire bill clearly</li>
                <li>Hold phone steady</li>
              </ul>
              <p className="text-xs font-semibold">Always verify extracted data before saving!</p>
            </div>
            
            <DragDropUpload 
              bucket="bills" 
              folder={new Date().getFullYear().toString()}
              maxFiles={1} 
              onUploadComplete={handleUploadComplete} 
              autoUpload={true}
            />
            
            {uploadedUrl && (
              <div className="text-center">
                <Button 
                  onClick={handleExtractData} 
                  disabled={extracting}
                  className="w-full h-12 bg-[#6B1D1D] hover:bg-[#6B1D1D]/90 text-white font-bold"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                      {progressText} ({progress}%)
                    </>
                  ) : "Extract Data"}
                </Button>
                <div className="mt-4">
                  <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    View Uploaded Image
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg flex justify-between items-center border border-green-200">
              <span className="font-semibold">✓ Data extracted! Please verify and save.</span>
              <a href={uploadedUrl!} target="_blank" rel="noreferrer" className="text-sm bg-white px-3 py-1 rounded shadow-sm text-green-700 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View Original
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Date (DD/MM/YY)</label>
                <Input value={extractedData.date} onChange={e => setExtractedData({...extractedData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
                <Input value={extractedData.time} onChange={e => setExtractedData({...extractedData, time: e.target.value})} />
              </div>
            </div>
            
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-600">Bill No</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600">Tax (₹)</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-600">Amount (₹)</th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {extractedData.entries.map((entry: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2"><Input value={entry.bill_no} onChange={e => updateEntry(i, 'bill_no', e.target.value)} className="h-8" /></td>
                      <td className="p-2"><Input type="number" value={entry.tax} onChange={e => updateEntry(i, 'tax', e.target.value)} className="h-8" /></td>
                      <td className="p-2"><Input type="number" value={entry.amount} onChange={e => updateEntry(i, 'amount', e.target.value)} className="h-8" /></td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeEntry(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 bg-gray-50 border-t">
                <button onClick={addRow} className="text-sm text-[#C9A84C] font-semibold hover:underline">+ Add Row</button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl flex gap-8">
              <div><p className="text-xs text-gray-500 uppercase font-bold">Total Bills</p><p className="text-2xl font-mono">{extractedData.total_bills}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Total Tax</p><p className="text-2xl font-mono">₹{extractedData.total_tax}</p></div>
              <div><p className="text-xs text-[#6B1D1D] uppercase font-bold">Total Amount</p><p className="text-2xl font-mono text-[#6B1D1D] font-bold">₹{extractedData.total_amount}</p></div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => handleSaveBill(false)} disabled={saving} className="bg-[#C9A84C] hover:bg-[#d4a853] text-[#1a1a2e] font-bold px-8">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Bill
              </Button>
              <Button variant="outline" onClick={() => {setExtractedData(null); setUploadedUrl(null);}}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today", amount: todayAmount, count: todayCount },
          { label: "This Week", amount: weekAmount, count: weekCount },
          { label: "This Month", amount: monthAmount, count: monthCount },
          { label: "This Year", amount: yearAmount, count: yearCount },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{stat.label}</h3>
            <div>
              <p className="text-3xl font-serif font-bold text-[#1a1a2e]">₹{stat.amount.toLocaleString('en-IN')}</p>
              <p className="text-sm text-[#6B1D1D] font-medium mt-1">{stat.count} bills generated</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-serif font-semibold mb-6">Daily Sales (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="amount" stroke="#C9A84C" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#6B1D1D'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif font-semibold">Monthly Breakdown</h3>
            <select className="border rounded p-1 text-sm bg-gray-50" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="amount" fill="#6B1D1D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-serif font-semibold mb-6">Top 5 Sales Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDays} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <YAxis dataKey="bill_date" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#1a1a2e', fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total_amount" fill="#C9A84C" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- BILLS TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4 bg-gray-50">
          <h2 className="text-xl font-serif font-semibold text-[#1a1a2e]">All Saved Bills</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="pl-9 h-10 w-40" />
            </div>
            <select className="border rounded-md px-3 h-10 text-sm bg-white" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
              <option value="all">All Months</option>
              {[...Array(12)].map((_, i) => <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('default', {month:'long'})}</option>)}
            </select>
            <select className="border rounded-md px-3 h-10 text-sm bg-white" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            {(dateFilter || monthFilter !== "all" || yearFilter !== "all") && (
              <Button variant="outline" onClick={() => {setDateFilter(""); setMonthFilter("all"); setYearFilter("all");}} className="h-10 text-xs">Clear</Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" /></div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No bills found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="w-10"></th>
                  <th className="px-6 py-4 text-left font-medium">Date</th>
                  <th className="px-6 py-4 text-left font-medium">Day</th>
                  <th className="px-6 py-4 text-center font-medium">Bills Count</th>
                  <th className="px-6 py-4 text-right font-medium">Tax</th>
                  <th className="px-6 py-4 text-right font-medium text-[#6B1D1D]">Total Amount</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill) => {
                  const date = new Date(bill.bill_date);
                  const isExpanded = expandedRows.includes(bill.id);
                  return (
                    <React.Fragment key={bill.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 text-center">
                          <button onClick={() => toggleRow(bill.id)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#1a1a2e]">
                          {date.toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {date.toLocaleDateString('en-IN', { weekday: 'long' })}
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{bill.total_bills}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 font-mono text-sm">
                          ₹{Number(bill.total_tax).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#6B1D1D] text-lg font-mono">
                          ₹{Number(bill.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {bill.image_url && (
                              <a href={bill.image_url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View Original">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button onClick={() => deleteBill(bill.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/80 border-b">
                          <td colSpan={7} className="px-16 py-6">
                            <div className="bg-white rounded-lg border shadow-sm p-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Bill Entries Detail</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono text-gray-600 mb-2 font-bold bg-gray-50 p-2 rounded">
                                <div>Bill No</div>
                                <div>Time</div>
                                <div>Tax</div>
                                <div>Amount</div>
                              </div>
                              <div className="divide-y border-t max-h-60 overflow-y-auto">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {bill.bill_entries?.map((e: any, i: number) => (
                                  <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 px-2 text-sm font-mono text-[#1a1a2e]">
                                    <div>#{e.bill_no}</div>
                                    <div>{bill.bill_time || '--:--'}</div>
                                    <div>₹{Number(e.tax).toLocaleString('en-IN')}</div>
                                    <div className="font-bold">₹{Number(e.amount).toLocaleString('en-IN')}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

