import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCcw, Download, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { uploadCorruptedFile } from '../services/api';

const FileReconstruction = ({ caseId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    if (!caseId) {
      alert("No active case found.");
      setLoading(false);
      return;
    }

    try {
      const res = await uploadCorruptedFile(caseId, file);
      setResult({
         type: 'text',
         original: res.original,
         corrected: res.corrected,
         filename: res.filename,
         audio_base64: res.audio_base64
      });
      localStorage.setItem('recentReconstructedFile', res.filename);
    } catch (err) {
      console.error(err);
      setResult({
         type: 'error',
         original: 'Unable to read source file',
         corrected: 'CRITICAL FAILURE: System error or backend unavailable. The file structure could not be processed.',
         filename: file.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
     if (!result) return;
     
     const filename = result.filename || 'file';
     const downloadName = `reconstructed_${filename}`;
     
     if (filename.toLowerCase().endsWith('.pdf')) {
         const doc = new jsPDF();
         const splitText = doc.splitTextToSize(result.corrected, 180);
         doc.text(splitText, 15, 15);
         doc.save(downloadName);
     } else {
         let link = document.createElement('a');
         link.download = downloadName;
         
         if (result.type === 'text') {
            const blob = new Blob([result.corrected], { type: 'text/plain' });
            link.href = URL.createObjectURL(blob);
         }
         
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     }
  };

  return (
    <div className="p-10 h-full overflow-y-auto bg-slate-50 w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">AI Data Reconstruction</h1>
          <p className="text-slate-500 mt-2 text-lg">Upload a corrupted text, audio, or PDF file. The AI engine will predict missing fragments to reconstruct the data.</p>
        </div>

        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <input type="file" id="real-upload" className="hidden" accept=".txt,.csv,.log,.md,.json,.mp3,.wav,.m4a,.pdf" onChange={handleFileChange} />
          <label htmlFor="real-upload" className="cursor-pointer inline-flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors w-full max-w-lg mx-auto">
             <Upload className="h-10 w-10 text-indigo-400 mb-4" />
             <span className="text-lg font-semibold text-indigo-700">{file ? file.name : "Select Corrupted Text, Audio, or PDF"}</span>
             <span className="text-sm text-indigo-400 mt-2">.txt, .csv, .log, .mp3, .wav, .pdf</span>
          </label>
          
          {file && (
            <div className="mt-8">
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                {loading ? <RefreshCcw className="animate-spin mr-3 h-5 w-5" /> : (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') ? <span className="mr-3 text-xl">🎵</span> : <FileText className="mr-3 h-5 w-5" />)}
                {loading ? "AI is analyzing and reconstructing..." : "Analyze & Reconstruct Evidence"}
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-end mb-4">
               <button onClick={handleDownload} className="flex items-center px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-md">
                  <Download className="w-4 h-4 mr-2" /> Download Reconstructed File
               </button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
               {/* Original Side */}
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center"><AlertTriangle className="text-orange-500 mr-2 h-5 w-5"/> Original Evidence</h3>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider">Corrupted</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                     <pre className="w-full h-full whitespace-pre-wrap text-sm text-slate-600 font-mono p-6 overflow-y-auto">
                        {result.original}
                     </pre>
                  </div>
               </div>
               
               {/* Reconstructed Side */}
               <div className="bg-white p-6 rounded-3xl shadow-lg shadow-indigo-100 border border-indigo-100 flex flex-col h-[500px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="flex items-center justify-between mb-4 border-b border-indigo-50 pb-4 shrink-0">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center"><CheckCircle className="text-emerald-500 mr-2 h-5 w-5"/> Reconstructed Evidence</h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">Recovered by AI</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-indigo-50 bg-indigo-50/50 flex flex-col items-center justify-center p-6">
                     {result.audio_base64 && (
                        <div className="w-full mb-6 p-4 bg-white rounded-xl shadow-sm border border-indigo-100 flex flex-col items-center">
                           <span className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                              <span className="text-lg mr-2">🎙️</span> Play Reconstructed Audio
                           </span>
                           <audio controls className="w-full max-w-sm">
                              <source src={`data:audio/mp3;base64,${result.audio_base64}`} type="audio/mp3" />
                              Your browser does not support the audio element.
                           </audio>
                        </div>
                     )}
                     <pre className="w-full flex-1 whitespace-pre-wrap text-sm text-indigo-950 font-mono overflow-y-auto">
                        {result.corrected}
                     </pre>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FileReconstruction;
