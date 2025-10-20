import { hc } from "hono/client";
import { Check, Copy, Download, FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";

function App() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string; filename?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, texts: 0, files: 0 });

  const client = hc<AppType>("/");

  console.log(client);

  // Check if we're viewing a drop
  const dropId = window.location.pathname.slice(1);
  const [viewDrop, setViewDrop] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (dropId && dropId.length === 8) {
      loadDrop(dropId);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const loadDrop = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drop/${id}`);
      if (res.ok) {
        const data = await res.json();
        setViewDrop(data);
      } else {
        setViewDrop({ error: "Not found or expired" });
      }
    } catch (err) {
      setViewDrop({ error: "Failed to load" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();

      if (mode === "text") {
        formData.append("text", text);
      } else if (file) {
        formData.append("file", file);
      } else {
        return;
      }

      const res = await fetch("http://localhost:5173/api/drop", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}${data.url}`;
        setResult({ ...data, url: fullUrl });
        setText("");
        setFile(null);
        fetchStats();
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goHome = () => {
    window.location.href = "/";
  };

  // Viewing a drop
  if (dropId && dropId.length === 8) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <button onClick={goHome} className="mb-6 text-purple-300 hover:text-white transition-colors">
            ← Back to Home
          </button>

          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">Loading...</div>
          ) : viewDrop?.error ? (
            <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
              <p className="text-xl">{viewDrop.error}</p>
            </div>
          ) : viewDrop?.type === "text" ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Text Drop</h2>
                <button onClick={() => copyToClipboard(viewDrop.content)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="bg-black/30 p-4 rounded-lg text-gray-100 overflow-x-auto whitespace-pre-wrap break-words">{viewDrop.content}</pre>
            </div>
          ) : viewDrop?.type === "file" ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
              <FileText size={64} className="mx-auto mb-4 text-purple-300" />
              <h2 className="text-2xl font-bold text-white mb-2">{viewDrop.filename}</h2>
              <a href={`/api/download/${dropId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium">
                <Download size={20} />
                Download File
              </a>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LocalDrop</h1>
          <p className="text-purple-200">Share text and files instantly on your local network</p>
          <div className="mt-4 text-sm text-purple-300">
            {stats.total} drops • {stats.texts} texts • {stats.files} files
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("text")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${mode === "text" ? "bg-purple-500 text-white shadow-lg" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}>
              <FileText size={20} className="inline mr-2" />
              Text
            </button>
            <button
              onClick={() => setMode("file")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${mode === "file" ? "bg-purple-500 text-white shadow-lg" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}>
              <Upload size={20} className="inline mr-2" />
              File
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "text" ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Drop your text here..."
                className="w-full h-64 p-4 bg-black/30 text-white rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none resize-none"
                required
              />
            ) : (
              <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center hover:border-purple-500/60 transition-colors">
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" required />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto mb-4 text-purple-300" />
                  <p className="text-purple-200 mb-2">{file ? file.name : "Click to select a file"}</p>
                  <p className="text-sm text-purple-300">Any file type accepted</p>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || (mode === "text" && !text) || (mode === "file" && !file)}
              className="w-full mt-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg">
              {uploading ? "Uploading..." : "Share"}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-white font-medium mb-2">✓ Shared successfully!</p>
              <div className="flex gap-2">
                <input type="text" value={result.url} readOnly className="flex-1 px-3 py-2 bg-black/30 text-white rounded border border-purple-500/30" />
                <button onClick={() => copyToClipboard(result.url)} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-sm text-purple-200 mt-2">Link expires in 24 hours</p>
            </div>
          )}
        </div>

        <p className="text-center text-purple-300 text-sm mt-8">All drops are temporary and expire after 24 hours</p>
      </div>
    </div>
  );
}

export default App;
