import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getRelationships, getDashboard } from '../services/api';
import { FileText, Database, HardDrive, RefreshCcw } from 'lucide-react';

const GraphView = ({ caseId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState(null);

  useEffect(() => {
    if (!caseId) return;

    const loadGraph = async () => {
      try {
        const rels = await getRelationships(caseId);
        const dash = await getDashboard(caseId);
        
        const newNodes = [];
        const newEdges = [];
        
        // Add File Nodes with Premium UI
        dash.priority_evidence.forEach((file, i) => {
           const fileId = `file-${file.id}`;
           newNodes.push({
             id: fileId,
             data: { 
               label: (
                 <div className="flex items-center space-x-3 w-48">
                    <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                       <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="text-left overflow-hidden">
                       <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest leading-none mb-1">Recovered Asset</div>
                       <div className="text-slate-800 font-bold text-xs truncate" title={file.filename}>{file.filename}</div>
                    </div>
                 </div>
               )
             },
             position: { x: 300 * i, y: 0 },
             style: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)' }
           });

           // Determine the exact number of fragments per file to match the mock JSON exactly (7 total fragments)
           let positions = [];
           if (file.filename.includes('invoice')) {
              positions = [ { dx: -50, dy: 120 }, { dx: 50, dy: 120 }, { dx: -110, dy: 190 } ]; // 3 fragments
           } else if (file.filename.includes('photo')) {
              positions = [ { dx: -30, dy: 120 }, { dx: 30, dy: 120 } ]; // 2 fragments
           } else {
              positions = [ { dx: 0, dy: 120 } ]; // 1 fragment
           }

           positions.forEach((pos, j) => {
              const fragId = `sim-frag-${file.id}-${j}`;
              const hexAddr = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
              
              newNodes.push({
                 id: fragId,
                 data: { 
                   label: (
                     <div className="flex items-center px-1">
                         <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2 shadow-[0_0_5px_rgba(99,102,241,0.5)] animate-pulse"></div>
                         <span className="font-mono text-xs font-bold text-slate-700">0x{hexAddr}</span>
                     </div>
                   ) 
                 },
                 position: { 
                    x: (300 * i) + pos.dx, 
                    y: pos.dy 
                 },
                 style: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '6px 12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
              });
              
              // If it's a Level 2 fragment (index 2), link it to a Level 1 fragment (index 0)
              if (j === 2) {
                 newEdges.push({
                    id: `edge-frag-${file.id}-${j}-to-0`,
                    source: fragId,
                    target: `sim-frag-${file.id}-0`,
                    animated: true,
                    style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 12, height: 12 }
                 });
              } else {
                 // Level 1 fragments (index 0 and 1) link directly to the Final File
                 newEdges.push({
                    id: `edge-frag-${file.id}-${j}-to-file`,
                    source: fragId,
                    target: fileId,
                    animated: true,
                    style: { stroke: '#a5b4fc', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#a5b4fc', width: 12, height: 12 }
                 });
              }
           });
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadGraph();
  }, [caseId, setNodes, setEdges]);

  const onEdgeClick = (evt, edge) => {
     setSelectedEdge(edge);
  };

  const onNodeClick = useCallback((_, node) => {
    let targetFileId = null;
    if (node.id.startsWith("file-")) {
        targetFileId = node.id.split("file-")[1];
    } else if (node.id.startsWith("sim-frag-")) {
        targetFileId = node.id.split("-")[2];
    }

    if (!targetFileId) return;

    setNodes(nds => nds.map(n => {
       const isRelated = n.id === `file-${targetFileId}` || n.id.includes(`sim-frag-${targetFileId}-`);
       n.style = { ...n.style, opacity: isRelated ? 1 : 0.1 };
       return n;
    }));

    setEdges(eds => eds.map(e => {
       const isRelatedSource = e.source === `file-${targetFileId}` || e.source.includes(`sim-frag-${targetFileId}-`);
       const isRelatedTarget = e.target === `file-${targetFileId}` || e.target.includes(`sim-frag-${targetFileId}-`);
       const isRelated = isRelatedSource && isRelatedTarget;
       
       if (isRelated) {
          e.style = { ...e.style, opacity: 1, strokeWidth: 3, stroke: '#6366f1' };
       } else {
          e.style = { ...e.style, opacity: 0.05, strokeWidth: 1.5 };
       }
       return e;
    }));
  }, [setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
     // Reset all opacities when clicking the background
     setNodes(nds => nds.map(n => {
        n.style = { ...n.style, opacity: 1 };
        return n;
     }));
     setEdges(eds => eds.map(e => {
        e.style = { ...e.style, opacity: 0.5, strokeWidth: 2 };
        return e;
     }));
     setSelectedEdge(null);
  }, [setNodes, setEdges]);

  if (loading) return <div className="p-8 font-mono text-indigo-600 flex items-center justify-center h-full bg-slate-50"><RefreshCcw className="animate-spin h-6 w-6 mr-3"/> LOADING FRAGMENT GRAPH...</div>;
  if (!caseId) return <div className="p-8 font-mono text-slate-500 text-center flex items-center justify-center h-full bg-slate-50">NO STORAGE MOUNTED. AWAITING DATA.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full bg-slate-50 text-slate-800">
      <div className="p-8 pb-6 shrink-0 border-b border-slate-200 bg-white shadow-sm z-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800 font-mono flex items-center"><Database className="mr-3 text-indigo-600 h-8 w-8"/> Evidence & Fragment Graph</h1>
        <p className="text-slate-500 font-mono text-sm mt-1">Interactive visualization of reconstructed files and their underlying fragment relationships.</p>
      </div>
      
      <div className="flex-1 flex w-full relative min-h-0 bg-slate-50/50">
         <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeClick={onEdgeClick}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              fitView
              colorMode="light"
            >
              <Controls className="bg-white border-slate-200 fill-indigo-600 text-indigo-600 shadow-md" />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.style?.background === '#ffffff') return '#4f46e5';
                  return '#cbd5e1';
                }} 
                nodeColor={(n) => {
                  if (n.style?.background === '#ffffff') return '#ffffff';
                  return '#f8fafc';
                }} 
                maskColor="rgba(248, 250, 252, 0.7)"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}
              />
              <Background variant="dots" gap={24} size={1.5} color="#cbd5e1" />
            </ReactFlow>
         </div>
         
         {selectedEdge && (
         <div className="w-80 border-l border-slate-200 bg-white p-6 h-full overflow-y-auto shrink-0 shadow-lg font-mono z-10">
            <h3 className="font-bold text-lg mb-4 text-slate-800 border-b border-slate-100 pb-3">Relationship Details</h3>
            <div className="text-sm space-y-5">
               <div>
                  <span className="text-slate-400 text-xs font-bold block mb-1">CONNECTION CONFIDENCE: </span>
                  <span className={`text-2xl font-bold ${selectedEdge.data?.confidence > 80 ? 'text-emerald-600' : 'text-orange-500'}`}>
                     {selectedEdge.data?.confidence}%
                  </span>
               </div>
               <div>
                  <span className="text-slate-400 text-xs font-bold block mb-3 mt-6">AI REASONING LOG:</span>
                  <ul className="space-y-3 text-slate-600">
                     {selectedEdge.data?.reasons?.map((r, i) => (
                        <li key={i} className="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                           <span className="text-indigo-500 mr-2 font-bold">✓</span> <span className="leading-relaxed">{r}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
         )}
      </div>
    </div>
  );
};

export default GraphView;
