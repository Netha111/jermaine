"use client";

import Image from 'next/image';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clapperboard,
  Image as ImageIcon,
  Share2,
  Play,
  Zap,
  Settings,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize video URL with cache busting on mount
  useEffect(() => {
    const baseUrl = "https://ifbivvpbwqsfxmbqaski.supabase.co/storage/v1/object/public/n8n/final.mp4";
    const timestamp = new Date().getTime();
    setVideoUrl(`${baseUrl}?t=${timestamp}`);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerWebhook = async (url: string, label: string, successMessage: string) => {
    if (!url) {
      showToast("Debug: URL not configured (Simulation)", 'info');
      return;
    }

    setLoading(label);
    try {
      await fetch(url);
      showToast(successMessage, 'success');
    } catch (error) {
      console.error("Webhook failed", error);
      showToast("Trigger failed check console", 'info');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateImages = () => {
    window.open("https://n8n.srv1242805.hstgr.cloud/form/e851a0b7-6542-4ebc-8e2a-388199b05b4c", "_blank");
    showToast("Opening image generation form...", "info");
  };

  const handleDynamicTrigger = () => {
    // Open the external n8n form for dynamic configuration
    window.open("https://n8n.srv1242805.hstgr.cloud/form/9d706a5b-d90f-42a8-8e6b-cf75ac0bf902", "_blank");
    showToast("Opening configuration form...", "info");
  };

  const handlePostVideo = () => {
    triggerWebhook(
      "https://n8n.srv1242805.hstgr.cloud/webhook/8f91f8e3-d06f-4e73-a545-e18065750416",
      "post",
      "Video posted to social media!"
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-3 text-slate-800 border-l-4 border-l-purple-500">
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <Zap size={20} className="text-yellow-400" />}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 w-full">
        <div className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Creator Studio"
            width={400}
            height={133}
            className="w-auto h-24 md:h-32 object-contain"
            priority
          />
        </div>

        <p className="text-slate-500 text-lg font-medium text-center md:text-left flex-1 md:text-center">
          Manage your content generation pipeline
        </p>

        <div className="flex items-center gap-3 px-4 py-2 glass-panel rounded-full text-sm font-medium text-slate-700 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Operational
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-6">

          {/* Image Generation Card */}
          <section className="glass-panel rounded-3xl p-8 transition-all hover:bg-black/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600">
                <ImageIcon size={28} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">Generate Images</h2>
            </div>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Create stunning visuals for your campaigns. Automatically uploads to Instagram & Facebook.
            </p>
            <button
              onClick={handleGenerateImages}
              disabled={loading === 'images'}
              className="w-full glass-button py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-slate-700 group"
            >
              {loading === 'images' ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Zap size={20} className="group-hover:text-yellow-300 transition-colors" />
                  <span>Start Generation</span>
                </>
              )}
            </button>
          </section>

          {/* Video Generation Card */}
          <section className="glass-panel rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>


            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 rounded-2xl bg-pink-100 text-pink-600">
                <Clapperboard size={28} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">Generate Videos</h2>
            </div>

            <div className="space-y-4 relative z-10">


              <div className="p-4 rounded-xl bg-black/5 border border-black/5 hover:border-black/10 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg text-slate-800">Dynamic Trigger</h3>
                  <span className="text-xs uppercase tracking-wider text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">Custom</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Open configuration for tailored content.</p>
                <button
                  onClick={handleDynamicTrigger}
                  disabled={loading === 'dynamic'}
                  className="w-full glass-button py-3 rounded-lg font-medium text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2"
                >
                  {loading === 'dynamic' ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                  Configure & Run
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <section className="glass-panel rounded-3xl p-2 flex-grow flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Live Preview
              </h2>
              <span className="text-sm text-slate-400">Latest Output</span>
            </div>

            <div className="flex-grow bg-slate-100 rounded-2xl relative overflow-hidden group mx-4 mb-4 border border-slate-200">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={48} className="animate-spin text-slate-300" />
                </div>
              )}
            </div>

            <div className="p-6 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-800">Ready to Publish?</h3>
                  <p className="text-sm text-slate-500">Push this content to your connected active channels.</p>
                </div>
                <button
                  onClick={handlePostVideo}
                  disabled={loading === 'post'}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {loading === 'post' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Share2 size={20} />
                      Post Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
