import React, { useState } from 'react';
import { Info, Play, RotateCcw, Film, BookOpen, GraduationCap, Sigma, Route } from 'lucide-react';
import Latex from 'react-latex-next';

const ACTORS = [
  { id: "John Ratzenberger", x: 400, y: 300 },
  { id: "Brad Garrett", x: 400, y: 100 },
  { id: "Wallace Shawn", x: 650, y: 200 },
  { id: "Brad Bird", x: 650, y: 450 },
  { id: "Lou Romano", x: 400, y: 550 },
  { id: "Bill Hader", x: 150, y: 450 },
  { id: "Bob Peterson", x: 150, y: 200 },
];

const EDGES = [
  { source: "Brad Bird", target: "Lou Romano", movies: ["Los Increíbles", "Ratatouille"] },
  { source: "Brad Bird", target: "John Ratzenberger", movies: ["Los Increíbles", "Ratatouille"] },
  { source: "John Ratzenberger", target: "Wallace Shawn", movies: ["Toy Story", "Los Increíbles"] },
  { source: "Bill Hader", target: "Bob Peterson", movies: ["Monsters University", "Buscando a Dory"] },
  { source: "John Ratzenberger", target: "Brad Garrett", movies: ["Bichos", "Buscando a Nemo", "Ratatouille"] },
  { source: "John Ratzenberger", target: "Bob Peterson", movies: ["Monsters, Inc.", "Buscando a Nemo", "Up"] },
  { source: "John Ratzenberger", target: "Lou Romano", movies: ["Los Increíbles", "Cars", "Ratatouille"] },
  { source: "John Ratzenberger", target: "Bill Hader", movies: ["Monsters, Inc.", "Intensa-Mente", "Buscando a Nemo", "Toy Story"] },
];

const MAX_SELECTION = 10;

export default function PixarNode() {
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showTheoryPanel, setShowTheoryPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'trayecto' | 'cicloEuler' | 'cicloHamil'>('trayecto');

  const getEdgeBetween = (u: string, v: string) => {
    return EDGES.find(e => 
      (e.source === u && e.target === v) || (e.source === v && e.target === u)
    );
  };

  const getEdgeIndex = (u: string, v: string) => {
    return EDGES.findIndex(e => 
      (e.source === u && e.target === v) || (e.source === v && e.target === u)
    );
  };

  const handleNodeClick = (actorId: string) => {
    if (selectedSequence.length >= MAX_SELECTION) {
      setSelectedSequence([actorId]);
      setAnalysisResult(null);
      return;
    }

    if (selectedSequence.length === 0) {
      setSelectedSequence([actorId]);
      setAnalysisResult(null);
    } else {
      const lastActor = selectedSequence[selectedSequence.length - 1];
      if (getEdgeBetween(lastActor, actorId)) {
        const newSequence = [...selectedSequence, actorId];
        setSelectedSequence(newSequence);
        analyzeSequence(newSequence);
      } else {
        alert(`No hay arista directa entre ${lastActor} y ${actorId}`);
      }
    }
  };

  const resetSelection = () => {
    setSelectedSequence([]);
    setAnalysisResult(null);
  };

  const analyzeSequence = (seq: string[]) => {
    if (seq.length < 2) return;

    let isCadena = true;
    let isCamino = true;
    let isCiclo = false;
    let isTrayectoEuleriano = false;

    const edgesVisitedIndices: number[] = [];
    const verticesMap: Record<string, number> = {};

    seq.forEach(v => verticesMap[v] = (verticesMap[v] || 0) + 1);

    for (let i = 0; i < seq.length - 1; i++) {
      const u = seq[i];
      const v = seq[i + 1];
      const edgeIdx = getEdgeIndex(u, v);
      if (edgeIdx === -1) {
        isCadena = false;
        break;
      }
      edgesVisitedIndices.push(edgeIdx);
    }

    if (isCadena) {
      const hasRepeatedEdges = new Set(edgesVisitedIndices).size !== edgesVisitedIndices.length;
      const hasRepeatedVertices = Object.values(verticesMap).some(count => count > 1);
      
      if (hasRepeatedEdges || hasRepeatedVertices) isCamino = false;

      const start = seq[0];
      const end = seq[seq.length - 1];
      const internalVertices = seq.slice(1, -1);
      const internalRepeats = internalVertices.some(v => seq.filter(x => x === v).length > 1);
      
      if (start === end && seq.length > 2 && !hasRepeatedEdges && !internalRepeats) {
        isCiclo = true;
      }

      const uniqueEdgesVisited = new Set(edgesVisitedIndices);
      if (uniqueEdgesVisited.size === EDGES.length && !hasRepeatedEdges) {
        isTrayectoEuleriano = true;
        setShowTheoryPanel(true); // Auto-open theory when eulerian path found
        setActiveTab('trayecto');
      }
    }

    setAnalysisResult({
      isCadena,
      isCamino,
      isCiclo,
      isTrayectoEuleriano,
      edgesCount: edgesVisitedIndices.length,
      verticesCount: seq.length
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* HEADER */}
      <header className="bg-blue-900 text-white p-6 shadow-md flex-shrink-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Film className="w-6 h-6 text-yellow-400" />
              PixarNode
            </h1>
            <p className="text-blue-200 text-sm mt-1">Proyecto de Matemática Discreta</p>
          </div>
          <div className="text-right text-xs text-blue-200 hidden md:block">
            <p>J.P. Rodríguez • M.A. Meneses • Y.D. Vera</p>
            <p>Grupo 52</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT: GRAPH CANVAS AREA */}
        <div className="flex-1 relative bg-slate-100 border-r border-slate-200 overflow-y-auto flex flex-col items-center">
          
          <div className="p-4 w-full flex justify-center">
             <svg width="800" height="600" viewBox="0 0 800 600" className="max-w-full h-auto drop-shadow-xl bg-white rounded-lg border border-slate-200">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>

              {/* Edges */}
              {EDGES.map((edge, index) => {
                const u = ACTORS.find(a => a.id === edge.source)!;
                const v = ACTORS.find(a => a.id === edge.target)!;
                
                let isSelected = false;
                if (selectedSequence.length > 1) {
                  for (let i = 0; i < selectedSequence.length - 1; i++) {
                    if (
                      (selectedSequence[i] === edge.source && selectedSequence[i+1] === edge.target) ||
                      (selectedSequence[i] === edge.target && selectedSequence[i+1] === edge.source)
                    ) {
                      isSelected = true;
                      break;
                    }
                  }
                }

                const isHovered = hoveredEdge === index;

                return (
                  <g key={index} 
                     onMouseEnter={() => setHoveredEdge(index)}
                     onMouseLeave={() => setHoveredEdge(null)}
                     className="cursor-pointer transition-all duration-300">
                    <line 
                      x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                      stroke={isSelected ? "#2563eb" : (isHovered ? "#f59e0b" : "#cbd5e1")} 
                      strokeWidth={isSelected || isHovered ? 6 : 3}
                      strokeLinecap="round"
                    />
                    {isHovered && (
                      <foreignObject x={(u.x + v.x)/2 - 100} y={(u.y + v.y)/2 - 40} width="200" height="100">
                        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg text-center border border-yellow-400 opacity-95">
                          <strong className="block text-yellow-400 mb-1">Películas en común:</strong>
                          {edge.movies.join(", ")}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {ACTORS.map((actor) => {
                const isSelected = selectedSequence.includes(actor.id);
                const isLast = selectedSequence.length > 0 && selectedSequence[selectedSequence.length - 1] === actor.id;
                const degree = EDGES.filter(e => e.source === actor.id || e.target === actor.id).length;
                const isOdd = degree % 2 !== 0;

                return (
                  <g key={actor.id} 
                     onClick={() => handleNodeClick(actor.id)}
                     onMouseEnter={() => setHoveredNode(actor.id)}
                     onMouseLeave={() => setHoveredNode(null)}
                     className="cursor-pointer">
                    
                    {isLast && (
                      <circle cx={actor.x} cy={actor.y} r={35} fill="none" stroke="#3b82f6" strokeWidth={4} opacity={0.5} className="animate-pulse" />
                    )}

                    <circle 
                      cx={actor.x} 
                      cy={actor.y} 
                      r={25} 
                      fill={isSelected ? "#3b82f6" : "#e2e8f0"} 
                      stroke={isSelected ? "#1e40af" : "#64748b"}
                      strokeWidth={3}
                      className="transition-colors duration-200"
                    />
                    
                    <text 
                      x={actor.x} y={actor.y} dy="0.35em" textAnchor="middle" 
                      fill={isSelected ? "white" : "#475569"} 
                      fontWeight="bold" fontSize="14"
                    >
                      {actor.id.split(' ').map(n => n[0]).join('')}
                    </text>

                    <text 
                      x={actor.x} y={actor.y + 45} textAnchor="middle" 
                      className={`text-sm font-semibold fill-slate-700 ${isSelected ? 'fill-blue-700' : ''}`}
                      style={{ textShadow: '0px 0px 4px white' }}
                    >
                      {actor.id}
                    </text>
                    
                    {/* Educational Note: Show degree if activeTab is trayecto */}
                    {showTheoryPanel && activeTab === 'trayecto' && isOdd && (
                      <text x={actor.x} y={actor.y - 35} textAnchor="middle" className="text-xs fill-red-500 font-bold">
                        Grado Impar ({degree})
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* SECCIÓN EDUCATIVA (PANEL INFERIOR) */}
          {showTheoryPanel && (
            <div className="w-full max-w-5xl p-4 mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                
                {/* Tabs Header */}
                <div className="flex border-b border-slate-100 bg-slate-50">
                  <button 
                    onClick={() => setActiveTab('trayecto')}
                    className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'trayecto' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Route className="w-4 h-4" /> Trayecto Euleriano
                  </button>
                  <button 
                    onClick={() => setActiveTab('cicloEuler')}
                    className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'cicloEuler' ? 'bg-white text-purple-600 border-t-2 border-purple-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <RotateCcw className="w-4 h-4" /> Ciclo Euleriano
                  </button>
                  <button 
                    onClick={() => setActiveTab('cicloHamil')}
                    className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'cicloHamil' ? 'bg-white text-emerald-600 border-t-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Sigma className="w-4 h-4" /> Ciclo Hamiltoniano
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[250px]">
                  
                  {/* TRAYECTO CONTENT */}
                  {activeTab === 'trayecto' && (
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Teorema del Trayecto Euleriano</h3>
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                          Un grafo conexo admite un <strong>trayecto euleriano</strong> (recorrer todas las aristas sin repetir) si y solo si tiene <strong>2 vértices de grado impar</strong>.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2 border border-blue-100">
                          El recorrido <strong>DEBE</strong> empezar en uno de ellos y terminar en el otro.
                        </div>
                        <div className="mt-4 p-3 border-l-4 border-red-400 bg-red-50 text-xs text-red-800">
                          <strong>En el grafo de Pixar:</strong> Los nodos impares son <em>Brad Garrett</em> (Grado 1) y <em>Wallace Shawn</em> (Grado 1). Por eso el trayecto no es cerrado.
                        </div>
                      </div>
                      <div className="w-48 flex items-center justify-center opacity-80">
                         <BookOpen className="w-24 h-24 text-blue-200" />
                      </div>
                    </div>
                  )}

                  {/* CICLO EULER CONTENT */}
                  {activeTab === 'cicloEuler' && (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Ciclo (Circuito) Euleriano</h3>
                        <p className="text-slate-600 text-sm mb-3">
                          Es un trayecto que recorre todas las aristas y <strong>regresa al punto de partida</strong>.
                        </p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-900 text-sm">
                          <strong>Condición Necesaria y Suficiente:</strong><br/>
                          Un grafo conexo tiene un Ciclo Euleriano sí y solo sí <strong>TODOS</strong> sus vértices tienen <strong>grado PAR</strong>.
                        </div>
                        <p className="text-xs text-slate-500 mt-3 italic">
                          El grafo de Pixar NO tiene ciclo euleriano porque tiene nodos de grado impar. A la derecha ves un ejemplo de un grafo que SÍ lo cumple.
                        </p>
                      </div>
                      
                      {/* Mini Graph Example */}
                      <div className="w-64 h-48 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center p-2 relative">
                        <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-400">EJEMPLO: GRAFO "CORBATÍN"</span>
                        <svg width="200" height="150" viewBox="0 0 200 150">
                           {/* Nodes: Bowtie shape. Center (100,75), TL(50,25), BL(50,125), TR(150,25), BR(150,125) */}
                           {/* Edges */}
                           <path d="M50,25 L50,125 L100,75 Z" fill="none" stroke="#9333ea" strokeWidth="2" /> {/* Left Tri */}
                           <path d="M150,25 L150,125 L100,75 Z" fill="none" stroke="#9333ea" strokeWidth="2" /> {/* Right Tri */}
                           {/* Nodes */}
                           <circle cx="100" cy="75" r="8" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="2" /> {/* Center deg 4 */}
                           <circle cx="50" cy="25" r="8" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="2" />  {/* TL deg 2 */}
                           <circle cx="50" cy="125" r="8" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="2" /> {/* BL deg 2 */}
                           <circle cx="150" cy="25" r="8" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="2" /> {/* TR deg 2 */}
                           <circle cx="150" cy="125" r="8" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="2" /> {/* BR deg 2 */}
                           {/* Degree Labels */}
                           <text x="100" y="60" textAnchor="middle" fontSize="10" fill="#6b21a8">Grado 4</text>
                        </svg>
                        <div className="text-[10px] text-center text-purple-700 font-medium mt-1">Todos los nodos tienen grado PAR</div>
                      </div>
                    </div>
                  )}

                  {/* HAMILTONIAN CONTENT */}
                  {activeTab === 'cicloHamil' && (
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Teoremas de Existencia (Ciclo Hamiltoniano)</h3>
                      <p className="text-slate-600 text-sm">
                        Buscan garantizar que existe un ciclo que visita <strong>todos los vértices</strong> una sola vez.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* DIRAC CARD */}
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col h-full">
                          <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4"/> 1. Teorema de Dirac (1952)
                          </h4>
                          <p className="text-xs text-emerald-900 leading-relaxed mb-4 flex-grow">
                            Si <Latex>$n \ge 3$</Latex> y el grado de <strong>CADA</strong> vértice es <Latex>$\ge n/2$</Latex>, entonces es hamiltoniano.
                          </p>
                          
                          {/* Dirac Visual */}
                          <div className="bg-white rounded border border-emerald-200 p-2 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 mb-1">EJEMPLO: "DIAMANTE" (n=4)</span>
                            <svg width="150" height="120" viewBox="0 0 150 120">
                              {/* Diamond: Top(75,20), L(40,60), R(110,60), Bot(75,100) */}
                              {/* Edges: Square + Diagonal L-R */}
                              <line x1="75" y1="20" x2="40" y2="60" stroke="#059669" strokeWidth="2"/>
                              <line x1="75" y1="20" x2="110" y2="60" stroke="#059669" strokeWidth="2"/>
                              <line x1="40" y1="60" x2="75" y2="100" stroke="#059669" strokeWidth="2"/>
                              <line x1="110" y1="60" x2="75" y2="100" stroke="#059669" strokeWidth="2"/>
                              <line x1="40" y1="60" x2="110" y2="60" stroke="#059669" strokeWidth="2"/>
                              
                              {/* Nodes */}
                              <circle cx="75" cy="20" r="10" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                              <text x="75" y="23" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">2</text>

                              <circle cx="75" cy="100" r="10" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                              <text x="75" y="103" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">2</text>

                              <circle cx="40" cy="60" r="10" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                              <text x="40" y="63" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">3</text>

                              <circle cx="110" cy="60" r="10" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                              <text x="110" y="63" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">3</text>
                            </svg>
                            <div className="text-[9px] text-center text-emerald-700 mt-1">
                              Todos grados <Latex>$\ge 2$ ($n/2$)</Latex>. ¡Cumple Dirac!
                            </div>
                          </div>
                        </div>

                        {/* ORE CARD */}
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col h-full">
                          <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4"/> 2. Teorema de Ore (1960)
                          </h4>
                          <p className="text-xs text-emerald-900 leading-relaxed mb-4 flex-grow">
                            Para <strong>TODO</strong> par <strong>NO</strong> adyacente <Latex>$(u, v)$: $deg(u) + deg(v) \ge n$</Latex>.
                            <br/>
                            <span className="italic opacity-80">(Más general que Dirac).</span>
                          </p>

                          {/* Ore Visual */}
                          <div className="bg-white rounded border border-emerald-200 p-2 flex flex-col items-center">
                             <span className="text-[10px] font-bold text-slate-400 mb-1">EJEMPLO: "CASA CON X" (n=5)</span>
                             <svg width="150" height="120" viewBox="0 0 150 120">
                               {/* Base Square with X: TL(45,50), TR(105,50), BL(45,100), BR(105,100) */}
                               {/* Peak: (75, 20) connected to TL, TR */}
                               
                               {/* Box Edges */}
                               <rect x="45" y="50" width="60" height="50" fill="none" stroke="#059669" strokeWidth="1.5"/>
                               {/* Diagonals */}
                               <line x1="45" y1="50" x2="105" y2="100" stroke="#059669" strokeWidth="1.5"/>
                               <line x1="105" y1="50" x2="45" y2="100" stroke="#059669" strokeWidth="1.5"/>
                               {/* Roof Edges */}
                               <line x1="75" y1="20" x2="45" y2="50" stroke="#059669" strokeWidth="1.5"/>
                               <line x1="75" y1="20" x2="105" y2="50" stroke="#059669" strokeWidth="1.5"/>

                               {/* Nodes */}
                               {/* Peak */}
                               <circle cx="75" cy="20" r="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="2"/> {/* Red to show fails Dirac */}
                               <text x="75" y="23" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7f1d1d">2</text>

                               {/* TL */}
                               <circle cx="45" cy="50" r="8" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                               <text x="45" y="53" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">4</text>
                               {/* TR */}
                               <circle cx="105" cy="50" r="8" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                               <text x="105" y="53" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">4</text>
                               {/* BL */}
                               <circle cx="45" cy="100" r="8" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                               <text x="45" y="103" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">3</text>
                               {/* BR */}
                               <circle cx="105" cy="100" r="8" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                               <text x="105" y="103" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">3</text>

                             </svg>
                             <div className="text-[9px] text-center text-emerald-700 mt-1 leading-tight">
                               El nodo rojo tiene grado 2 (<Latex>$&lt;2.5$</Latex>). <br/>
                               <strong>Falla Dirac</strong>, pero cumple Ore.
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div className="w-full md:w-80 bg-slate-50 p-6 border-l border-slate-200 overflow-y-auto flex-shrink-0">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" /> Contexto
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              Este grafo representa la red de colaboración de actores de voz en 8 películas de Pixar.
              <br/><br/>
              <strong>Nodos:</strong> Actores.<br/>
              <strong>Aristas:</strong> Colaboración en 2+ películas.
            </p>
          </div>

          <div className="mb-4">
            <button 
              onClick={() => setShowTheoryPanel(!showTheoryPanel)}
              className="w-full py-2 px-4 bg-white border border-blue-300 text-blue-700 rounded-lg shadow-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              {showTheoryPanel ? 'Ocultar Teoría' : 'Ver Teoría de Grafos'}
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" /> 
                Ruta Actual
                <span className={`text-xs font-normal ml-1 px-2 py-0.5 rounded-full ${selectedSequence.length >= MAX_SELECTION ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                  {selectedSequence.length}/{MAX_SELECTION}
                </span>
              </h2>
              <button 
                onClick={resetSelection}
                className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>

            {selectedSequence.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic text-sm">
                Selecciona nodos en el grafo para comenzar a trazar una ruta.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSequence.map((actor, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">
                        {actor.split(' ')[0]}
                      </span>
                      {i < selectedSequence.length - 1 && (
                        <span className="mx-1 text-slate-400">→</span>
                      )}
                    </div>
                  ))}
                  {selectedSequence.length === MAX_SELECTION && (
                     <div className="w-full text-xs text-red-500 flex items-center font-medium italic mt-2 bg-red-50 p-2 rounded">
                       Has llegado al límite. El próximo clic iniciará una nueva ruta.
                     </div>
                  )}
                </div>

                {/* REAL TIME ANALYSIS */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Análisis Matemático</h3>
                  
                  {analysisResult ? (
                    <div className="grid grid-cols-1 gap-2">
                      <AnalysisItem 
                        label="Es una Cadena" 
                        valid={analysisResult.isCadena} 
                        desc="Sucesión de vértices conectados" 
                      />
                      <AnalysisItem 
                        label="Es un Camino" 
                        valid={analysisResult.isCamino} 
                        desc="Sin repetir vértices ni aristas" 
                      />
                      <AnalysisItem 
                        label="Es un Ciclo" 
                        valid={analysisResult.isCiclo} 
                        desc="Inicia y termina en el mismo vértice" 
                      />
                      <AnalysisItem 
                        label="Trayecto Euleriano" 
                        valid={analysisResult.isTrayectoEuleriano} 
                        desc="Recorre TODAS las aristas exactamente una vez" 
                        highlight={true}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Selecciona al menos 2 nodos.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function AnalysisItem({ label, valid, desc, highlight = false }: { label: string, valid: boolean, desc: string, highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-2 rounded ${valid ? (highlight ? 'bg-green-100 border border-green-200' : 'bg-green-50') : 'bg-slate-50'} transition-colors`}>
      <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${valid ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
        {valid ? '✓' : '✕'}
      </div>
      <div>
        <div className={`font-semibold ${valid ? 'text-green-800' : 'text-slate-500'}`}>{label}</div>
        <div className="text-[10px] text-slate-500 leading-tight">{desc}</div>
      </div>
    </div>
  );
}
