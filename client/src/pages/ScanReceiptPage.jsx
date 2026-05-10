import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, ShieldCheck, Sparkles } from "lucide-react";

const ScanReceiptPage = () => {
  return (
    <MainLayout title="Scan Receipt">
      <div className="max-w-3xl mx-auto flex flex-col gap-12 py-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner group">
            <Camera className="w-10 h-10 group-hover:scale-110 transition-transform stroke-[2.5]" />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight mb-4">AI Receipt Scanner</h2>
          <p className="text-base font-medium text-muted-foreground max-w-md mx-auto leading-relaxed">
            Snap a photo and let our AI automatically extract items, amounts, and tax for instant splitting.
          </p>
        </div>

        <Card className="border-2 border-dashed border-gray-200 bg-white hover:border-primary/50 transition-all cursor-pointer group rounded-[3rem] overflow-hidden">
          <CardContent className="p-20">
             <div className="flex flex-col items-center gap-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                   <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                   <p className="text-xl font-black text-foreground">Upload Receipt</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3">JPG, PNG or PDF (Max 10MB)</p>
                </div>
                <Button rounded="full" className="px-12 font-black text-xs uppercase tracking-widest h-14 shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                   Select File
                </Button>
             </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-start">
              <div className="p-3 bg-orange-50 rounded-2xl text-primary">
                 <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">Smart Extraction</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Our advanced OCR engine reads text even in low light and auto-categorizes items.
                </p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-start">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">Secure & Private</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Data is processed securely and encrypted. Your receipt images are never stored permanently.
                </p>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanReceiptPage;
