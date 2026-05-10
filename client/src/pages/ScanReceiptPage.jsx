import { useState, useEffect, useRef } from 'react';
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2, FileText, AlertCircle, Plus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";

const ScanReceiptPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScannedData(null);
    }
  };

  const handleScan = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group first');
      return;
    }
    if (!selectedFile) {
      toast.error('Please upload a bill image first');
      return;
    }

    setScanning(true);
    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      toast.loading('Analyzing receipt with AI...', { id: 'scan-toast' });
      const res = await api.post('/ai/scan-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.scanned) {
        setScannedData(res.data.receipt);
        toast.success('Receipt analyzed! ✨', { id: 'scan-toast' });
      } else {
        toast.error(res.data.message || 'Could not read receipt. Try a clearer photo.', { id: 'scan-toast' });
      }
    } catch (err) {
      toast.error('Scan failed. Please try again.', { id: 'scan-toast' });
    } finally {
      setScanning(false);
    }
  };

  const handleAddExpense = async () => {
    if (!scannedData || !selectedGroup) return;

    try {
      const expenseData = {
        description: scannedData.storeName || 'Scanned Receipt',
        amount: scannedData.total,
        category: 'other', // Default
        group: selectedGroup._id,
        splitType: 'equal',
        receiptUrl: previewUrl // This should be the Cloudinary URL from the scan response
      };

      await api.post('/expenses', expenseData);
      toast.success('Expense added to group! 🚀');
      navigate(`/groups/${selectedGroup._id}`);
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScannedData(null);
  };

  return (
    <MainLayout title="Scan Receipt">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 py-6 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 h-12 w-12"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-4xl font-black text-foreground tracking-tight">AI Scanner</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed">
                Upload a real bill to automatically split it with your group.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Step 1: Group Selection */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black shadow-sm shadow-primary/10">1</span>
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Target Group</h3>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {groups.map(group => (
                <div 
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                    selectedGroup?._id === group._id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5' 
                      : 'border-gray-100 bg-white hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-sm ${
                      selectedGroup?._id === group._id ? 'bg-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all'
                    }`}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate tracking-tight ${selectedGroup?._id === group._id ? 'text-primary' : 'text-foreground'}`}>
                        {group.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                        {group.members?.length} Members
                      </p>
                    </div>
                    {selectedGroup?._id === group._id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
              {groups.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-inner">
                   <p className="text-xs font-bold text-muted-foreground">No groups found</p>
                   <Button asChild variant="link" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest mt-3">
                      <Link to="/groups/new">Create Group First</Link>
                   </Button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Upload & Scan */}
          <div className="lg:col-span-9 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Upload Card */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black shadow-sm shadow-primary/10">2</span>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Upload Bill</h3>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*"
                />

                <Card 
                  className={`border-2 border-dashed transition-all rounded-[3rem] h-[400px] flex flex-col items-center justify-center relative overflow-hidden ${
                    selectedGroup 
                      ? 'border-primary/20 bg-white hover:border-primary/50 cursor-pointer shadow-sm' 
                      : 'border-gray-100 bg-gray-50/30 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => selectedGroup && !scanning && fileInputRef.current.click()}
                >
                  {previewUrl ? (
                    <div className="absolute inset-0 group">
                      <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-black uppercase tracking-widest">Change Photo</p>
                      </div>
                    </div>
                  ) : (
                    <CardContent className="flex flex-col items-center gap-6 p-10">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-400 group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-foreground">Tap to Upload</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Maximum file size: 10MB</p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {selectedFile && !scannedData && (
                  <Button 
                    onClick={handleScan} 
                    disabled={scanning} 
                    className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20"
                  >
                    {scanning ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4" />
                        Run AI Scan
                      </div>
                    )}
                  </Button>
                )}
              </div>

              {/* Results Area */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black shadow-sm shadow-primary/10">3</span>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Review & Add</h3>
                </div>

                <div className={`h-[400px] rounded-[3rem] border transition-all flex flex-col p-8 overflow-hidden ${
                  scannedData ? 'bg-white border-primary/20 shadow-xl' : 'bg-gray-50/50 border-gray-100 border-dashed'
                }`}>
                  {scannedData ? (
                    <div className="flex-1 flex flex-col h-full">
                       <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                          <div>
                             <h4 className="text-xl font-black text-foreground tracking-tight">{scannedData.storeName || 'Scanned Store'}</h4>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{scannedData.date || 'No date found'}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-black text-[10px] uppercase">
                             {scannedData.currency || 'INR'}
                          </Badge>
                       </div>

                       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6">
                          {scannedData.items?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                               <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-500">{i+1}</div>
                                  <span className="text-xs font-bold text-foreground truncate max-w-[140px]">{item.name}</span>
                               </div>
                               <span className="text-xs font-black text-foreground">₹{item.price.toLocaleString()}</span>
                            </div>
                          ))}
                       </div>

                       <div className="mt-auto space-y-3 pt-6 border-t border-gray-50">
                          <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                             <span>Subtotal</span>
                             <span>₹{scannedData.subtotal?.toLocaleString() || scannedData.total?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                             <span>Tax</span>
                             <span>₹{scannedData.tax?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                             <span className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Grand Total</span>
                             <span className="text-2xl font-black text-primary tracking-tighter">₹{scannedData.total.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                       <FileText className="w-12 h-12 text-gray-300 mb-6" />
                       <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                         Results will appear here after scanning your bill
                       </p>
                    </div>
                  )}
                </div>

                {scannedData && (
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={reset} 
                      className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-gray-100"
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={handleAddExpense} 
                      className="flex-[2] h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 group"
                    >
                      <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                      Add to {selectedGroup.name}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex gap-5 items-start relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-all"></div>
                  <div className="p-3 bg-orange-50 rounded-2xl text-primary relative z-10">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">Smart Extraction</h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      AI reads store names, dates, and itemized lists automatically.
                    </p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex gap-5 items-start relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-all"></div>
                  <div className="p-3 bg-green-50 rounded-2xl text-green-600 relative z-10">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">Secure Storage</h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Your receipts are encrypted and stored securely for audit trails.
                    </p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex gap-5 items-start relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-all"></div>
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 relative z-10">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">Quality Tips</h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Ensure good lighting and a flat surface for the best scan accuracy.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanReceiptPage;
