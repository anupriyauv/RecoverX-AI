import React, { useState, useEffect } from 'react';
import { Calendar, FilePlus, Edit3, Trash2, ShieldAlert, Cpu } from 'lucide-react';

const TimelineView = () => {
  const [filename, setFilename] = useState("Evidence_File.dat");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const recent = localStorage.getItem('recentReconstructedFile');
    if (recent) setFilename(recent);
    
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  }, []);

  const events = [
    { date: 'March 14, 2026 - 09:15 AM', title: `File ${filename} created`, icon: <FilePlus className="h-5 w-5 text-blue-500" />, desc: `Original document '${filename}' was authored and saved to the volume by the victim.` },
    { date: 'March 18, 2026 - 11:30 AM', title: 'File modified', icon: <Edit3 className="h-5 w-5 text-emerald-500" />, desc: 'Document was legitimately accessed and content was updated by the user.' },
    { date: 'Yesterday - 02:45 PM', title: 'CYBER BREACH: File deleted', icon: <Trash2 className="h-5 w-5 text-red-500" />, desc: 'MALICIOUS ACTIVITY DETECTED: Hacker deleted the file to destroy evidence. MFT entry marked as unallocated.' },
    { date: 'Today - 08:10 AM', title: 'Fragment recovered', icon: <ShieldAlert className="h-5 w-5 text-orange-500" />, desc: `RecoverX system scan identified orphan data blocks from '${filename}' hidden deep in unallocated space.` },
    { date: `Today - ${currentTime || 'Just Now'}`, title: 'AI reconstruction', icon: <Cpu className="h-5 w-5 text-indigo-500" />, desc: 'Groq LLM successfully bypassed the corruption and pieced together fragments into a perfectly readable format.' },
  ];

  return (
    <div className="p-10 w-full h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-800">Forensic Event Timeline</h1>
          <p className="text-slate-500 mt-2 text-lg">Chronological lifecycle of the recovered evidence file.</p>
        </div>
        
        <div className="relative border-l-2 border-slate-200 ml-6 md:ml-0 md:pl-0 md:mx-auto md:w-full">
          {events.map((ev, i) => (
             <div key={i} className="mb-10 ml-8 md:ml-12 relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-1 bg-white border-2 border-slate-200 h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shadow-sm">
                   {ev.icon}
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                   <span className="text-sm font-semibold tracking-wider text-indigo-600 mb-2 block uppercase">{ev.date}</span>
                   <h3 className="text-2xl font-bold text-slate-800 mb-3">{ev.title}</h3>
                   <p className="text-slate-600 text-lg leading-relaxed">{ev.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TimelineView;
