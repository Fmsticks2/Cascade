import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Market } from '../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MarketTreeProps {
  markets: Market[];
  onNodeClick: (marketId: string) => void;
  currentMarketId?: string;
}

const MarketTree: React.FC<MarketTreeProps> = ({ markets, onNodeClick, currentMarketId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: Math.max(500, wrapperRef.current.clientHeight),
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleZoom = (factor: number) => {
    setTransform(prev => ({
        ...prev,
        k: Math.max(0.2, Math.min(3, prev.k + factor))
    }));
  };

  const handleReset = () => {
      setTransform({ k: 1, x: 0, y: 0 });
  };

  useEffect(() => {
    if (!svgRef.current || markets.length === 0) return;

    // 1. Construct Hierarchy
    const roots = markets.filter(m => !m.parentId || !markets.find(pm => pm.id === m.parentId));
    
    const dataWithRoot = [
      { id: 'ROOT', question: 'Cascade Protocol', status: 'Active', childMarketIds: roots.map(r => r.id) } as any,
      ...markets
    ];

    const stratify = d3.stratify<any>()
      .id(d => d.id)
      .parentId(d => d.parentId || (d.id === 'ROOT' ? undefined : 'ROOT'));

    let root;
    try {
        root = stratify(dataWithRoot);
    } catch (e) {
        console.error("Failed to stratify data", e);
        return;
    }

    // 2. Setup Tree Layout
    // Use larger layout size to allow for scrolling/panning
    const treeWidth = Math.max(dimensions.width, 1000); 
    const treeLayout = d3.tree<any>().size([treeWidth, dimensions.height - 150]);
    
    const hierarchyData = treeLayout(root);

    // 3. D3 Selection & Rendering
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const container = svg.append("g")
      .attr("class", "container-group")
      .attr("transform", `translate(${50 + transform.x}, ${50 + transform.y}) scale(${transform.k})`);

    // Links
    container.selectAll(".link")
      .data(hierarchyData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any
      )
      .attr("fill", "none")
      .attr("stroke", "#475569") // slate-600
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);

    // Nodes
    const node = container.selectAll(".node")
      .data(hierarchyData.descendants())
      .enter().append("g")
      .attr("class", d => `node ${d.data.id === currentMarketId ? 'active-node' : ''}`)
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", (d: any) => d.data.id === 'ROOT' ? 'default' : 'pointer')
      .on("click", (event, d) => {
          if(d.data.id !== 'ROOT') onNodeClick(d.data.id);
      });

    // Node Circles
    node.append("circle")
      .attr("r", (d: any) => d.data.id === 'ROOT' ? 8 : 20)
      .attr("fill", (d: any) => {
          if (d.data.id === 'ROOT') return '#64748b';
          if (d.data.id === currentMarketId) return '#14b8a6'; // cascade-500
          return '#1e293b'; // slate-800
      })
      .attr("stroke", (d: any) => {
          if (d.data.id === 'ROOT') return 'none';
          if (d.data.id === currentMarketId) return '#99f6e4'; // cascade-200
          return '#334155'; // slate-700
      })
      .attr("stroke-width", 2)
      .transition().duration(500)
      .attr("r", (d: any) => (d.data.id === currentMarketId ? 25 : (d.data.id === 'ROOT' ? 8 : 20)));

    // Icons inside nodes
    node.append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .style("font-family", "Inter")
      .style("font-size", "10px")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text((d: any) => d.data.childMarketIds?.length > 0 && d.data.id !== 'ROOT' ? '+' : '');

    // Labels
    node.append("foreignObject")
      .attr("x", -75)
      .attr("y", 28)
      .attr("width", 150)
      .attr("height", 60)
      .style("overflow", "visible")
      .html((d: any) => {
          if (d.data.id === 'ROOT') return '';
          const isSelected = d.data.id === currentMarketId;
          return `
            <div class="text-center transition-all duration-300 ${isSelected ? 'scale-110 z-50 relative' : 'opacity-70 hover:opacity-100'}">
                <div class="bg-slate-900/95 text-slate-200 text-[10px] leading-tight px-2 py-1.5 rounded-md border ${isSelected ? 'border-cascade-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'border-slate-700'} shadow-lg backdrop-blur">
                    ${d.data.question.substring(0, 35)}${d.data.question.length > 35 ? '...' : ''}
                </div>
            </div>
          `;
      });

  }, [markets, dimensions, currentMarketId, transform]);

  return (
    <div ref={wrapperRef} className="w-full h-[500px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden shadow-inner group">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700 shadow-lg">
           <span className="text-xs font-mono text-cascade-400 font-semibold tracking-wider flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-cascade-500 animate-pulse"></div>
             MARKET TOPOLOGY
           </span>
        </div>
      </div>
      
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full block cursor-move" 
           onMouseDown={(e) => {
             // Simple pan logic
             const startX = e.clientX - transform.x;
             const startY = e.clientY - transform.y;
             
             const handleMouseMove = (moveEvent: MouseEvent) => {
               setTransform(prev => ({
                 ...prev,
                 x: moveEvent.clientX - startX,
                 y: moveEvent.clientY - startY
               }));
             };
             
             const handleMouseUp = () => {
               window.removeEventListener('mousemove', handleMouseMove);
               window.removeEventListener('mouseup', handleMouseUp);
             };
             
             window.addEventListener('mousemove', handleMouseMove);
             window.addEventListener('mouseup', handleMouseUp);
           }}
      />
      
      {/* Legend/Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          <button 
            onClick={() => handleZoom(0.2)}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-400 border border-slate-700 shadow-lg transition-colors"
            title="Zoom In"
          >
              <ZoomIn className="w-4 h-4" />
          </button>
           <button 
            onClick={() => handleZoom(-0.2)}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-400 border border-slate-700 shadow-lg transition-colors"
            title="Zoom Out"
          >
              <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-400 border border-slate-700 shadow-lg transition-colors"
            title="Reset View"
          >
              <RotateCcw className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};

export default MarketTree;