import React, { useState } from 'react';
import {
  getAndroidProjectFiles,
  generateAndroidProjectZip,
  AndroidProjectFile
} from '../services/androidProjectGenerator';
import {
  Download,
  FileCode,
  Check,
  Copy,
  Terminal,
  Smartphone,
  FolderTree,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AndroidExportModal: React.FC = () => {
  const files = getAndroidProjectFiles();
  const [selectedFilePath, setSelectedFilePath] = useState<string>('app/build.gradle.kts');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zipBlob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NavidMusic-AndroidStudio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating project ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            Package: com.navid.music
          </span>
          <h2 className="text-2xl font-black text-white">
            Android Studio Project & APK Builder
          </h2>
          <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
            Download the complete, compilable Android Studio project package with Media3 ExoPlayer, MediaStore local audio scanner, background Foreground Service, and hardware Equalizer.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-400/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 shrink-0"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>{isDownloading ? 'Bundling ZIP...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Quick 3-Step Guide to build the APK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-sm">
            1
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Open in Android Studio
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Extract the ZIP and choose <b>File &gt; Open...</b> in Android Studio. Gradle will automatically sync dependencies.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-black flex items-center justify-center text-sm">
            2
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Build APK
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Click <b>Build &gt; Build APK(s)</b>, or in terminal run:
            <code className="block bg-black/40 p-1.5 rounded text-[11px] font-mono text-emerald-300 mt-1">
              ./gradlew assembleDebug
            </code>
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 font-black flex items-center justify-center text-sm">
            3
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Install on Phone
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Connect your phone via USB and run:
            <code className="block bg-black/40 p-1.5 rounded text-[11px] font-mono text-violet-300 mt-1">
              adb install app-debug.apk
            </code>
            or transfer file directly to device storage.
          </p>
        </div>
      </div>

      {/* Interactive Project Source Code Explorer */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Android Studio Project Tree
            </h3>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--text-primary)] border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* File List / Navigation */}
          <div className="md:col-span-4 border-r border-white/10 p-3 space-y-1 bg-black/20 overflow-y-auto max-h-[460px]">
            {files.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white font-bold shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate pr-2">{file.path}</span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* File Content Preview */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 p-4 overflow-hidden">
            <div className="mb-2 pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {selectedFile.description}
              </span>
            </div>

            <pre className="flex-1 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed p-2 bg-black/40 rounded-xl border border-white/5 select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
