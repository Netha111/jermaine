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
  CheckCircle2,
  CalendarClock,
  X,
  Sparkles,
  Save
} from 'lucide-react';

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [n8nStatus, setN8nStatus] = useState<string>("Checking...");
  // Supabase Editable Content Data
  const [contentFields, setContentFields] = useState({
    video_title: "",
    post: "",
    tags: "",
    caption: ""
  });
  const [isUpdatingField, setIsUpdatingField] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<'video' | 'image' | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [bestTimeLoading, setBestTimeLoading] = useState(false);
  const [bestTimeSuggestion, setBestTimeSuggestion] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const refreshMedia = () => {
    const videoBase = "https://ifbivvpbwqsfxmbqaski.supabase.co/storage/v1/object/public/n8n/final.mp4";
    const imageBase = "https://ifbivvpbwqsfxmbqaski.supabase.co/storage/v1/object/public/n8n/image.jpg";
    const timestamp = new Date().getTime();
    setVideoUrl(`${videoBase}?t=${timestamp}`);
    setImageUrl(`${imageBase}?t=${timestamp}`);
  };

  // Initialize media URLs with cache busting on mount
  useEffect(() => {
    refreshMedia();
    fetchSupabaseStatus();

    // Auto-refresh the backend status every 15 seconds
    const interval = setInterval(fetchSupabaseStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchSupabaseStatus = async () => {
    try {
      // Using direct REST API fetch - no SDK required!
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ifbivvpbwqsfxmbqaski.supabase.co";
      // Using the service_role key to bypass RLS
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYml2dnBid3FzZnhtYnFhc2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzMjcxNSwiZXhwIjoyMDg2NTA4NzE1fQ.D5d1hVVn1FVqWvkv-KKRmd0XBmM6OEZzaStKdJafjoQ";

      // Fetching the specific row where id is 23 - extending select to fetch content fields
      const response = await fetch(`${supabaseUrl}/rest/v1/n8n?id=eq.23&select=status,video_title,post,tags,caption`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });

      const data = await response.json();

      const updateFields = (rowData: any) => {
        setN8nStatus(rowData.status || "Idle");
        // Only update state if the user IS NOT actively typing in that field (to prevent their cursor from jumping/overwriting mid-word)
        setContentFields(prev => ({
          video_title: document.activeElement?.id === 'input-video_title' ? prev.video_title : (rowData.video_title || ""),
          post: document.activeElement?.id === 'input-post' ? prev.post : (rowData.post || ""),
          tags: document.activeElement?.id === 'input-tags' ? prev.tags : (rowData.tags || ""),
          caption: document.activeElement?.id === 'input-caption' ? prev.caption : (rowData.caption || "")
        }));
      };

      if (Array.isArray(data) && data.length > 0) {
        updateFields(data[0]);
      } else if (data && data.status) {
        updateFields(data);
        // Fallback if Supabase returned a single object instead of array
        setN8nStatus(data.status);
      } else {
        setN8nStatus("No data found");
        console.log("Supabase empty response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch Supabase status", error);
      setN8nStatus("Error Connection");
    }
  };

  const handleUpdateField = async (field: keyof typeof contentFields, value: string) => {
    if (!value && value !== "") return;

    setIsUpdatingField(field);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ifbivvpbwqsfxmbqaski.supabase.co";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYml2dnBid3FzZnhtYnFhc2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzMjcxNSwiZXhwIjoyMDg2NTA4NzE1fQ.D5d1hVVn1FVqWvkv-KKRmd0XBmM6OEZzaStKdJafjoQ";

      const response = await fetch(`${supabaseUrl}/rest/v1/n8n?id=eq.23`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) throw new Error("Failed to update database");
      showToast(`Saved ${field.replace('_', ' ')}`, "success");
    } catch (error) {
      console.error(`Error updating ${field}`, error);
      showToast(`Failed to save ${field}. Check console`, "info");
      // Optionally trigger a full refresh to revert to the true backend state on failure
      fetchSupabaseStatus();
    } finally {
      setIsUpdatingField(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerWebhook = async (url: string, label: string, successMessage: string, options?: RequestInit) => {
    if (!url) {
      showToast("Debug: URL not configured (Simulation)", 'info');
      return;
    }

    setLoading(label);
    try {
      await fetch(url, options);
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

  const handleOpenSchedule = async (target: 'video' | 'image') => {
    setScheduleTarget(target);
    setScheduledTime("");
    setBestTimeSuggestion(null);
    setScheduleModalOpen(true);

    // Fetch Best Time Suggestion
    setBestTimeLoading(true);
    try {
      const response = await fetch("https://n8n.srv1242805.hstgr.cloud/webhook/458fcc22-ff87-4a51-92c2-2eac12d738d1");
      const data = await response.json();

      let suggestion = "6pm to 7pm or Morning 10am - 11am";

      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        suggestion = data[0].output;
      }

      setBestTimeSuggestion(suggestion);
    } catch (error) {
      console.error("Failed to fetch best time suggestion", error);
      // Fallback on error
      setBestTimeSuggestion("6pm to 7pm or Morning 10am - 11am");
    } finally {
      setBestTimeLoading(false);
    }
  };

  const submitSchedule = () => {
    if (!scheduledTime) {
      showToast("Please select a date and time", "info");
      return;
    }

    // Format to exactly "YYYY-MM-DDTHH:mm:00"
    const formattedTime = scheduledTime.length === 16 ? `${scheduledTime}:00` : scheduledTime;

    setScheduleModalOpen(false);

    if (scheduleTarget === 'video') {
      const url = `https://n8n.srv1242805.hstgr.cloud/webhook/8f91f8e3-d06f-4e73-a545-e18065750416?time=${formattedTime}`;
      triggerWebhook(url, "post-video", "Video scheduled successfully!");
    } else {
      const url = `https://n8n.srv1242805.hstgr.cloud/webhook/cd9b5af7-49b4-4213-aed2-5b7d4aa20bf4`;
      triggerWebhook(url, "post-image", "Image post scheduled successfully!", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: formattedTime })
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Backend Status Tracker Strip - At the very top */}
      <div className="bg-slate-900 text-slate-200 px-6 py-2.5 text-sm flex justify-center items-center gap-6 w-full shadow-md z-40 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </div>
          <span className="font-semibold tracking-wide text-xs uppercase text-slate-400">n8n Workflow Backend:</span>
          <span className="font-mono text-sm bg-slate-800 border border-slate-700 px-3 py-1 rounded text-green-400 font-bold shadow-inner">
            {n8nStatus}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-12 flex flex-col gap-8 max-w-7xl mx-auto">
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
                    <h3 className="font-medium text-lg text-slate-800">Video Generation Form</h3>
                    <span className="text-xs uppercase tracking-wider text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">Custom</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Open configuration for tailored video content.</p>
                  <button
                    onClick={handleDynamicTrigger}
                    disabled={loading === 'dynamic'}
                    className="w-full glass-button py-3 rounded-lg font-medium text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2"
                  >
                    {loading === 'dynamic' ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} strokeWidth={2.5} />}
                    Configure Video
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
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => { refreshMedia(); showToast("Media metadata refreshed", "success"); }}
                    className="text-xs hover:text-blue-600 text-blue-500 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    Refresh Previews
                  </button>
                  <span className="text-sm text-slate-400">Latest Output</span>
                </div>
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

              <div className="px-6 pb-4 flex justify-end">
                <button
                  onClick={() => handleOpenSchedule('video')}
                  disabled={loading === 'post-video'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {loading === 'post-video' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Share2 size={20} />
                      Post Now
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 pt-2 border-t border-slate-100 mt-4">
                <div className="mb-4">
                  <h3 className="font-medium text-slate-800 flex items-center gap-2 mb-1">
                    <ImageIcon size={18} className="text-purple-500" />
                    Generated Image Post
                  </h3>
                  <p className="text-sm text-slate-500">Review the generated image and its accompanying content.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col md:flex-row gap-4 mb-2">
                    <div className="w-full md:w-1/3 flex-shrink-0 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 aspect-square relative flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt="Generated Image Preview"
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 size={32} className="animate-spin text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <p className="text-sm font-medium text-slate-700 mb-1">Image URL:</p>
                      <a href="https://ifbivvpbwqsfxmbqaski.supabase.co/storage/v1/object/public/n8n/image.jpg" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all block mb-3 bg-white p-2 rounded border border-slate-200">
                        https://ifbivvpbwqsfxmbqaski.supabase.co/storage/v1/object/public/n8n/image.jpg
                      </a>

                      <div className="space-y-3 mt-1">
                        {/* Video Title Field */}
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Video Title</label>
                          <input
                            id="input-video_title"
                            type="text"
                            className="w-full text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                            value={contentFields.video_title}
                            onChange={(e) => setContentFields(prev => ({ ...prev, video_title: e.target.value }))}
                            onBlur={(e) => handleUpdateField("video_title", e.target.value)}
                            placeholder="Enter video title..."
                          />
                          {isUpdatingField === "video_title" && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-3 top-[34px]" />}
                        </div>

                        {/* Caption Field */}
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Caption / Hook</label>
                          <textarea
                            id="input-caption"
                            className="w-full text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none min-h-[60px] resize-y"
                            value={contentFields.caption}
                            onChange={(e) => setContentFields(prev => ({ ...prev, caption: e.target.value }))}
                            onBlur={(e) => handleUpdateField("caption", e.target.value)}
                            placeholder="Enter a caption or hook..."
                          />
                          {isUpdatingField === "caption" && <Loader2 size={14} className="animate-spin text-purple-500 absolute right-3 top-[34px]" />}
                        </div>

                        {/* Core Post Content Field */}
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Core Post Content</label>
                          <textarea
                            id="input-post"
                            className="w-full text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none min-h-[100px] resize-y"
                            value={contentFields.post}
                            onChange={(e) => setContentFields(prev => ({ ...prev, post: e.target.value }))}
                            onBlur={(e) => handleUpdateField("post", e.target.value)}
                            placeholder="Write the main post body here..."
                          />
                          {isUpdatingField === "post" && <Loader2 size={14} className="animate-spin text-pink-500 absolute right-3 top-[34px]" />}
                        </div>

                        {/* Tags Field */}
                        <div className="relative">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Hashtags</label>
                          <input
                            id="input-tags"
                            type="text"
                            className="w-full text-sm text-slate-600 bg-slate-100/50 p-2.5 rounded-lg border border-slate-200 focus:border-slate-400 focus:bg-white transition-all outline-none"
                            value={contentFields.tags}
                            onChange={(e) => setContentFields(prev => ({ ...prev, tags: e.target.value }))}
                            onBlur={(e) => handleUpdateField("tags", e.target.value)}
                            placeholder="#automation #growth"
                          />
                          {isUpdatingField === "tags" && <Loader2 size={14} className="animate-spin text-slate-500 absolute right-3 top-[34px]" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleOpenSchedule('image')}
                    disabled={loading === 'post-image'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                    {loading === 'post-image' ? (
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

        {/* Scheduling Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarClock className="text-blue-500" />
                  Schedule {scheduleTarget === 'video' ? 'Video' : 'Image'} Post
                </h3>
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100 flex items-start gap-3">
                <div className="mt-0.5 text-indigo-500">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900 mb-1">AI Best Time to Post</h4>
                  {bestTimeLoading ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 mt-1">
                      <Loader2 size={14} className="animate-spin" />
                      Analyzing audience data...
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-indigo-800 leading-relaxed font-medium bg-white/60 p-3 rounded-lg border border-indigo-100 shadow-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {bestTimeSuggestion}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700"
                />
                <p className="mt-3 text-xs text-slate-500">
                  The post will be scheduled via webhook in the format `YYYY-MM-DDTHH:mm:00`.
                </p>
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSchedule}
                  disabled={!scheduledTime}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  Confirm Scheduling
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
