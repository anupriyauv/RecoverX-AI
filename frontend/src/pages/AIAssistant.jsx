import React, { useState, useRef } from 'react';
import { askAI, generateAIReport } from '../services/api';
import { Bot, Send, FileText, Loader2, Sparkles, Download, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAssistant = ({ caseId }) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "SYSTEM ONLINE. GROQ LLM INITIALIZED.\n\nI am the RecoverX Intelligence Agent. How can I assist with this digital forensics case?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || !caseId) return;

    const userText = query;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await askAI(caseId, userText);
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "ERR: Connection to AI reasoning engine failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!caseId) return;
    setIsGeneratingReport(true);
    try {
      const res = await generateAIReport(caseId);
      setReport(res.report);
    } catch (e) {
      console.error(e);
      setReport("ERR: Failed to compile forensic report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    // Create a new window for printing the report natively
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to download the PDF report.");
      return;
    }

    // Get the HTML content of the report
    const reportHtml = reportRef.current.innerHTML;

    // Write a clean HTML document into the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>RecoverX AI Report - Case ${caseId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1, h2, h3 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { font-size: 20px; }
            p { margin-bottom: 1em; }
            ul, ol { margin-bottom: 1em; padding-left: 20px; }
            li { margin-bottom: 0.5em; }
            strong { font-weight: 600; color: #0f172a; }
            em { font-style: italic; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>RecoverX Digital Forensics Report</h1>
          <div style="font-size: 14px;">
            ${reportHtml}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 border-b border-slate-100 bg-white flex items-center shrink-0">
          <Terminal className="h-6 w-6 text-indigo-600 mr-3" />
          <div>
             <h2 className="text-xl font-bold font-mono text-slate-800">AI INVESTIGATOR TERMINAL</h2>
             <div className="text-xs text-indigo-500 font-mono mt-1 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> GROQ INFERENCE ENGINE ACTIVE</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm bg-slate-50">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-indigo-200 rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                {msg.role === 'assistant' ? (
                   <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                   </div>
                ) : (
                   msg.text
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-5 text-indigo-500 flex items-center shadow-sm font-mono text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> PROCESSING QUERY...
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query evidence database..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-mono transition-shadow"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !query.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-all shadow-md shadow-indigo-200 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Report Section */}
      <div className="w-1/3 flex flex-col bg-white shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
           <h2 className="text-xl font-bold flex items-center font-mono text-slate-800"><FileText className="mr-3 h-5 w-5 text-emerald-600" /> FORENSIC REPORT</h2>
           <div className="flex space-x-2">
             {report && (
               <button 
                  onClick={handleDownloadPDF}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-xs font-bold rounded-lg hover:bg-emerald-100 flex items-center transition-colors shadow-sm"
               >
                  <Download className="h-3 w-3 mr-2" /> EXPORT PDF
               </button>
             )}
             <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-2 text-xs font-bold rounded-lg hover:bg-purple-100 disabled:opacity-50 flex items-center transition-colors shadow-sm"
             >
                {isGeneratingReport ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                COMPILE
             </button>
           </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
           {!report && !isGeneratingReport && (
              <div className="text-center text-slate-400 mt-20 font-mono">
                 <FileText className="h-20 w-20 mx-auto mb-6 text-slate-300" />
                 <p className="text-sm font-bold tracking-widest text-slate-500">AWAITING REPORT COMPILATION</p>
                 <p className="text-xs mt-3 text-slate-400">Initialize Groq LLM to generate automated forensic summary.</p>
              </div>
           )}
           {isGeneratingReport && (
              <div className="text-center text-purple-600 mt-20 flex flex-col items-center font-mono">
                 <Loader2 className="h-14 w-14 animate-spin mb-6" />
                 <p className="text-sm tracking-widest font-bold">COMPILING FINDINGS...</p>
                 <p className="text-xs text-slate-500 mt-2">Groq Inference Engine Analyzing Fragments</p>
              </div>
           )}
           {report && !isGeneratingReport && (
              <div ref={reportRef} className="prose prose-sm max-w-none bg-white p-8 rounded-2xl border border-slate-200 shadow-sm font-mono text-slate-700 prose-headings:text-slate-900 prose-a:text-indigo-600">
                 <ReactMarkdown>{report}</ReactMarkdown>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
