import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, HardDrive, FileText, LayoutDashboard, Database, Search, AlertTriangle, Fingerprint, RefreshCcw, Bot, Clock, FilePlus2, Upload, Download } from 'lucide-react'
import { getCases, createCase, scanCase, getDashboard, getFragments } from './services/api'
import GraphView from './pages/GraphView'
import AIAssistant from './pages/AIAssistant'
import TimelineView from './pages/TimelineView'
import FileReconstruction from './pages/FileReconstruction'

const Dashboard = ({ activeCase, isScanning, scanStep, handleScan, data }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [loadingFragments, setLoadingFragments] = useState(false);
  const [expandedFragmentId, setExpandedFragmentId] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = async (type) => {
     if (!activeCase) return;
     setLoadingFragments(true);
     setShowModal(true);
     setModalTitle(type);
     try {
       const fragments = await getFragments(activeCase.id);
       if (type === 'Total Fragments') {
          setModalData(fragments);
       } else if (type === 'Recoverable') {
          setModalData(fragments.filter(f => f.status === 'Recoverable'));
       } else if (type === 'Partial Recovery') {
          setModalData(fragments.filter(f => f.status === 'Partial'));
       } else if (type === 'Corrupted') {
          setModalData(fragments.filter(f => f.status === 'Corrupted'));
       }
     } catch (err) {
       console.error(err);
     } finally {
       setLoadingFragments(false);
     }
  };

  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-full w-full">
      <header className="mb-10 flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
             Dashboard
             <span className="ml-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">Case #{activeCase?.id || 'RX-2026-019'}</span>
           </h1>
           <p className="text-slate-500 mt-2 text-lg">Digital Recovery Intelligence Platform Overview</p>
        </div>
        
        <div>
          <button onClick={() => window.print()} disabled={isScanning || !data} className="print-hide bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-all cursor-pointer shadow-lg shadow-indigo-200 active:scale-95">
             <Download className="mr-2 h-5 w-5" />
             Export Judge-Ready Report
          </button>
        </div>
      </header>

      <div id="dashboard-content" className="bg-slate-50">
      {/* New Evidence Acquisition Dropzone */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-8 shadow-sm">
         <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
               <Upload className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-800">EVIDENCE ACQUISITION & STORAGE INGESTION</h2>
               <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mt-1">Drop raw partitions (.raw, .dd, .txt, .bin) or execute the 8-stage pipeline.</p>
            </div>
         </div>
         <div className="grid md:grid-cols-2 gap-8">
            <label className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors">
               <Upload className="h-8 w-8 text-slate-400 mb-4" />
               <span className="font-bold text-slate-700">DROP DAMAGED STORAGE / DRIVE IMAGE</span>
               <span className="text-sm text-slate-500 mt-2">Drag and drop file here, or click to browse filesystem</span>
               <input type="file" className="hidden" onChange={(e) => {
                  if (e.target.files.length > 0) {
                     handleScan(e);
                  }
               }} />
               <div className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-lg shadow-sm font-medium text-slate-700 hover:bg-slate-50">Browse Disk Image</div>
            </label>
            <div className="border border-indigo-100 bg-indigo-50/30 rounded-2xl p-8 flex flex-col justify-center">
               <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wider">PRE-LOADED EVIDENCE PACK</span>
                  <span className="text-[10px] text-slate-400 font-mono">NVMe BLOCK 0x7FA0</span>
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">Simulated Corporate Breach</h3>
               <p className="text-sm text-slate-600 mb-6">Contains fragmented SQL tables, ransomware extortion notes, exfiltrated wire transfer logs, and broken executable headers ready for deterministic 8-stage neural reassembly.</p>
               <button onClick={handleScan} disabled={isScanning} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex justify-center items-center">
                  <RefreshCcw className={`mr-2 h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'EXECUTING NEURAL REASSEMBLY...' : 'RUN RECOVERY SCAN (SIMULATED STORAGE)'}
               </button>
            </div>
         </div>
      </div>

      {/* Main Dashboard Data */}
      {!data && !isScanning && (
         <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <HardDrive className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Awaiting Evidence Ingestion</h2>
            <p className="text-slate-500 text-lg">Use the acquisition module above to begin the recovery pipeline.</p>
         </div>
      )}

      {isScanning && (
         <div className="rounded-3xl border border-indigo-100 bg-white p-16 flex flex-col items-center justify-center min-h-[450px] shadow-lg shadow-indigo-100/50">
            <RefreshCcw className="h-16 w-16 text-indigo-500 animate-spin mb-10" />
            
            <div className="w-full max-w-lg space-y-4">
              <div className={`flex items-center space-x-4 p-5 rounded-xl transition-all duration-500 ${scanStep >= 1 ? 'bg-indigo-50 border border-indigo-100' : 'opacity-40'}`}>
                 <div className={`h-4 w-4 rounded-full ${scanStep > 1 ? 'bg-indigo-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                 <span className="font-semibold text-slate-700 text-lg">Reading Signature & Metadata...</span>
              </div>
              <div className={`flex items-center space-x-4 p-5 rounded-xl transition-all duration-500 ${scanStep >= 2 ? 'bg-indigo-50 border border-indigo-100' : 'opacity-40'}`}>
                 <div className={`h-4 w-4 rounded-full ${scanStep > 2 ? 'bg-indigo-500' : (scanStep === 2 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200')}`}></div>
                 <span className="font-semibold text-slate-700 text-lg">Extracting Fragment Clusters...</span>
              </div>
              <div className={`flex items-center space-x-4 p-5 rounded-xl transition-all duration-500 ${scanStep >= 3 ? 'bg-indigo-50 border border-indigo-100' : 'opacity-40'}`}>
                 <div className={`h-4 w-4 rounded-full ${scanStep > 3 ? 'bg-purple-500' : (scanStep === 3 ? 'bg-purple-500 animate-pulse' : 'bg-slate-200')}`}></div>
                 <span className="font-semibold text-slate-700 text-lg">AI Reasoning & Prioritization...</span>
              </div>
              <div className={`flex items-center space-x-4 p-5 rounded-xl transition-all duration-500 ${scanStep >= 4 ? 'bg-indigo-50 border border-indigo-100' : 'opacity-40'}`}>
                 <div className={`h-4 w-4 rounded-full ${scanStep > 4 ? 'bg-emerald-500' : (scanStep === 4 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200')}`}></div>
                 <span className="font-semibold text-slate-700 text-lg">Finalizing Investigation Dashboard...</span>
              </div>
            </div>
         </div>
      )}

      {data && !isScanning && (
      <div className="animate-fade-in-up">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div onClick={() => handleCardClick('Total Fragments')} className="glass-card cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center space-y-2">
           <Database className="h-10 w-10 text-indigo-500 mb-2 animate-float" />
           <h3 className="text-4xl font-bold text-slate-800">{data.total_fragments}</h3>
           <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">Total Fragments</p>
        </div>
        
        <div onClick={() => handleCardClick('Recoverable')} className="glass-card cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center space-y-2">
          <HardDrive className="h-10 w-10 text-emerald-500 mb-2 animate-float" style={{ animationDelay: '1s' }} />
          <h3 className="text-4xl font-bold text-slate-800">{data.recoverable}</h3>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">Recoverable<br/>Fragments</p>
        </div>
        
        <div onClick={() => handleCardClick('Partial Recovery')} className="glass-card cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center space-y-2">
          <Activity className="h-10 w-10 text-orange-500 mb-2 animate-float" style={{ animationDelay: '2s' }} />
          <h3 className="text-4xl font-bold text-slate-800">{data.partial}</h3>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">Partially<br/>Recovered</p>
        </div>
        
        <div onClick={() => handleCardClick('Corrupted')} className="glass-card cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center space-y-2">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-2 animate-float" style={{ animationDelay: '3s' }} />
          <h3 className="text-4xl font-bold text-slate-800">{data.corrupted}</h3>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">Corrupted<br/>Fragments</p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
         <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center text-slate-800 border-b border-slate-100 pb-4">
              <Search className="mr-3 h-6 w-6 text-indigo-500"/> 
              Priority Evidence
            </h2>
            <div className="space-y-4">
               {data.priority_evidence.slice(0, 5).map((ev) => (
               <div key={ev.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center space-x-4">
                     {ev.priority === 'HIGH' ? (
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-md shadow-red-200"></div>
                     ) : (
                        <div className="h-3 w-3 rounded-full bg-orange-400 shadow-md shadow-orange-100"></div>
                     )}
                     <div>
                        <p className="font-bold text-slate-800">{ev.filename}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">{ev.priority} Priority • {ev.category}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-xl font-bold ${ev.recovery_confidence > 80 ? 'text-emerald-600' : 'text-orange-500'}`}>{ev.recovery_confidence}%</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confidence</p>
                  </div>
               </div>
               ))}
            </div>
         </div>

         <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center text-slate-800 border-b border-slate-100 pb-4">
              <Activity className="mr-3 h-6 w-6 text-purple-500"/> 
              AI Recovery Intelligence
            </h2>
            
            <div className="flex-1 flex flex-col justify-center items-center py-8">
               <div className="relative flex items-center justify-center h-40 w-40 rounded-full border-8 border-slate-50 mb-6 shadow-inner">
                 <div className="absolute inset-0 rounded-full border-8 border-indigo-500 opacity-80"></div>
                 <div className="text-5xl font-bold text-slate-800">{data.recovery_confidence}<span className="text-2xl text-slate-400">%</span></div>
               </div>
               <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest text-center">Global Recovery Score</div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-auto pt-8 border-t border-slate-100">
               <div className="text-center bg-slate-50 py-5 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-bold text-red-500">{data.sensitive_objects}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sensitive Files</p>
               </div>
               <div className="text-center bg-slate-50 py-5 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-bold text-indigo-500">{data.fragment_clusters}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Evidence Clusters</p>
               </div>
            </div>
         </div>
      </div>
      
      {/* Extortion Threat Banner */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center shadow-sm">
         <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-center shrink-0 mr-6">
            <AlertTriangle className="h-6 w-6 text-red-500" />
         </div>
         <div className="flex-1">
            <h3 className="text-red-700 font-bold text-lg">CRITICAL EXPLOIT DETECTED: ACTIVE EXTORTION THREAT</h3>
            <p className="text-red-600/80 text-sm font-medium mt-1">Extortion pattern matches identified inside recovered fragment cluster [item_cluster_012]</p>
         </div>
         <button onClick={() => navigate('/ai')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors whitespace-nowrap">
            Inspect Ransomware Artifact ➔
         </button>
      </div>
      
      </div>
      )}
      
      </div>

      {/* Modal Overlay */}
      {showModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-800">{modalTitle} Details</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                     ✕
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                  {loadingFragments ? (
                     <div className="flex justify-center items-center py-20 text-indigo-600">
                        <RefreshCcw className="animate-spin h-8 w-8 mr-3" /> Loading fragment data...
                     </div>
                  ) : modalData.length === 0 ? (
                     <div className="text-center text-slate-400 py-10 font-medium">No fragments found in this category.</div>
                  ) : (
                     <div className="space-y-3">
                        {modalData.map(f => (
                           <div key={f.id} 
                                onClick={() => setExpandedFragmentId(expandedFragmentId === f.id ? null : f.id)}
                                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-indigo-300 transition-colors cursor-pointer">
                              <div className="p-4 flex justify-between items-center">
                                 <div>
                                    <p className="font-bold text-slate-700 font-mono text-sm">
                                       {f.filename ? f.filename : `Sector Fragment 0x${f.offset.toString(16).toUpperCase()}`}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                       Type: {f.fragment_type} • Size: {f.size} bytes • Offset: {f.offset}
                                    </p>
                                 </div>
                                 <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                       f.status === 'Recoverable' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                       f.status === 'Partial' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                       'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                       {f.status}
                                    </span>
                                 </div>
                              </div>
                              
                              {/* Hex Dump Expansion */}
                              {expandedFragmentId === f.id && (
                                 <div className="bg-slate-900 p-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                       <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Memory Hex Dump Preview</span>
                                       <span className="text-[10px] text-slate-500 font-mono">0x{f.offset.toString(16).toUpperCase()}</span>
                                    </div>
                                    <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{f.status === 'Corrupted' || f.filename?.includes('unknown') ? 
`00000000  A3 4B 9F 11 2C 5E 77 8A  00 FF E1 D4 C8 32 B5 67  |.K..,.^w.....2.g|
00000010  19 8C 3A E2 4F 1B 99 0D  55 6A 22 8F 3E 10 AB C4  |..:.O...Uj".>...|
00000020  D5 7F E8 B9 41 5C 6D 90  F3 28 A1 06 7B 82 3C EF  |....A\\m..(...{.<.|
00000030  9C 55 14 D7 8E 33 F0 1A  6B 49 2D 85 0F A6 E9 3B  |.U...3..kI-....;|` 
: f.filename?.includes('photo') ? 
`00000000  FF D8 FF E0 00 10 4A 46  49 46 00 01 01 01 00 48  |......JFIF.....H|
00000010  00 48 00 00 FF E1 00 58  45 78 69 66 00 00 4D 4D  |.H.....XExif..MM|
00000020  00 2A 00 00 00 08 00 02  01 12 00 03 00 00 00 01  |.*..............|
00000030  00 01 00 00 87 69 00 04  00 00 00 01 00 00 00 26  |.....i.........&|` 
: f.filename?.includes('wiretap') || f.filename?.includes('wav') ?
`00000000  52 49 46 46 24 08 00 00  57 41 56 45 66 6D 74 20  |RIFF$...WAVEfmt |
00000010  10 00 00 00 01 00 02 00  44 AC 00 00 10 B1 02 00  |........D.......|
00000020  04 00 10 00 64 61 74 61  00 08 00 00 00 00 00 00  |....data........|
00000030  24 17 1E F3 3C 13 3C 14  16 F9 18 F9 34 17 15 00  |$...<.<.....4...|`
:
`00000000  49 4e 56 4f 49 43 45 20  2d 20 43 4f 4e 46 49 44  |INVOICE - CONFID|
00000010  45 4e 54 49 41 4c 0a 44  61 74 65 3a 20 32 30 32  |ENTIAL.Date: 202|
00000020  36 2d 30 33 2d 31 34 0a  54 6f 3a 20 41 63 6d 65  |6-03-14.To: Acme|
00000030  20 43 6f 72 70 0a 41 6d  6f 75 6e 74 20 44 75 65  | Corp.Amount Due|`}
                                    </pre>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
               <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                  <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                     Close
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function SidebarLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}>
      {React.cloneElement(icon, { className: `mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}` })}
      {label}
    </Link>
  );
}

function App() {
  const [data, setData] = useState(null)
  const [activeCase, setActiveCase] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        let cases = await getCases()
        let currentCase
        if (cases.length === 0) {
          currentCase = await createCase("Damaged Storage Demo", "demo_drive_01")
        } else {
          currentCase = cases[0]
        }
        setActiveCase(currentCase)
        
        if (currentCase.status === 'Analysis Complete') {
            const dashData = await getDashboard(currentCase.id)
            setData(dashData)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    initialize()
  }, [])

  const handleScan = async (e) => {
    if (e && e.target) e.target.value = null; 
    if (!activeCase) return
    setIsScanning(true)
    setData(null)
    setScanStep(1)
    
    setTimeout(() => setScanStep(2), 800)
    setTimeout(() => setScanStep(3), 1600)
    setTimeout(() => setScanStep(4), 2600)

    try {
      await scanCase(activeCase.id)
      const dashData = await getDashboard(activeCase.id)
      setTimeout(() => {
         setData(dashData)
         setIsScanning(false)
      }, 3000) 
    } catch (err) {
      console.error(err)
      setIsScanning(false)
    }
  }

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-indigo-600 text-xl font-medium"><RefreshCcw className="animate-spin h-8 w-8 mr-4"/> Initializing Forensic System...</div>

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-white text-slate-800">
        <aside className="w-72 border-r border-slate-200 bg-white px-6 py-8 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <Fingerprint className="h-7 w-7" />
            </div>
            <div>
               <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1">RecoverX</div>
               <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Intelligence Platform</div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            <SidebarLink to="/" icon={<LayoutDashboard />} label="Dashboard" />
            <SidebarLink to="/graph" icon={<Database />} label="Fragment Graph" />
            <SidebarLink to="/ai" icon={<Bot />} label="AI Investigator" />
            <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Advanced Tools</div>
            <SidebarLink to="/timeline" icon={<Clock />} label="Event Timeline" />
            <SidebarLink to="/reconstruct" icon={<FilePlus2 />} label="Reconstruct File" />
          </nav>

          <div className="mt-auto px-4 py-5 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500">SYSTEM STATUS</span>
                <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> ONLINE</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">MODEL</span>
                <span className="text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">GROQ LLM</span>
             </div>
          </div>
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<Dashboard activeCase={activeCase} isScanning={isScanning} scanStep={scanStep} handleScan={handleScan} data={data} />} />
            <Route path="/graph" element={<GraphView caseId={activeCase?.id} />} />
            <Route path="/ai" element={<AIAssistant caseId={activeCase?.id} />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/reconstruct" element={<FileReconstruction caseId={activeCase?.id} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
