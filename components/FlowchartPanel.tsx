import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { XIcon } from './icons/XIcon';
import { FlowchartData, FlowchartNode, FlowchartEdge } from '../services/flowchartGenerator';
// @ts-ignore
import dagre from 'dagre';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface FlowchartPanelProps {
    data: FlowchartData;
    onClose: () => void;
}

const IO_SKEW = 20;

const FlowchartNodeComponent: React.FC<{ node: FlowchartNode }> = ({ node }) => {
    const { type, label, x = 0, y = 0, width = 100, height = 50 } = node;
    
    const textLines = label.split('\n');
    const textY = (-(textLines.length - 1) * 14) / 2;

    const shape = useMemo(() => {
        switch (type) {
            case 'start':
            case 'end':
                return <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={height / 2} ry={height / 2} />;
            case 'decision':
                return <polygon points={`0,${-height / 2} ${width / 2},0 0,${height / 2} ${-width / 2},0`} />;
            case 'io':
                return <polygon points={`${IO_SKEW - width/2},${-height / 2} ${width / 2},${-height / 2} ${width / 2 - IO_SKEW},${height / 2} ${-width / 2},${height / 2}`} />;
            case 'process':
            default:
                if (width < 1 && height < 1) { // Dummy connector node
                    return <circle cx="0" cy="0" r="2" className="fill-[var(--border-secondary)] stroke-none" />;
                }
                return <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={5} ry={5} />;
        }
    }, [type, width, height]);

    return (
        <g transform={`translate(${x}, ${y})`} className="fill-[var(--bg-tertiary)] stroke-[var(--border-secondary)] stroke-2 transition-transform duration-300">
            {shape}
            {!(width < 1 && height < 1) && (
              <text textAnchor="middle" y={textY} className="fill-[var(--text-primary)] stroke-none font-sans" style={{ fontSize: '14px' }}>
                  {textLines.map((line, index) => (
                      <tspan key={index} x="0" dy={index > 0 ? "1.2em" : "0"}>{line}</tspan>
                  ))}
              </text>
            )}
        </g>
    );
};

export const FlowchartPanel: React.FC<FlowchartPanelProps> = ({ data, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1, h: 1 });
    const initialViewBoxWidth = useRef(1);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const gestureStateRef = useRef({
        isPanning: false,
        isPinching: false,
        lastPanPoint: { x: 0, y: 0 },
        lastPinchDist: 0,
    });

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { laidOutNodes, laidOutEdges, graphWidth, graphHeight } = useMemo(() => {
        if (!data.nodes.length) return { laidOutNodes: [], laidOutEdges: [], graphWidth: 0, graphHeight: 0 };
        
        const g = new dagre.graphlib.Graph({ multigraph: true });
        g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 70 });
        g.setDefaultEdgeLabel(() => ({}));

        data.nodes.forEach(node => {
            g.setNode(node.id, { ...node, width: node.width, height: node.height });
        });

        data.edges.forEach(edge => {
            g.setEdge(edge.from, edge.to, { label: edge.label });
        });

        dagre.layout(g);

        const laidOutNodes = g.nodes().map(nodeId => g.node(nodeId) as FlowchartNode);
        const laidOutEdges = g.edges().map(edgeInfo => ({
            ...g.edge(edgeInfo),
            ...edgeInfo
        }));
        
        const graphWidth = g.graph().width || 0;
        const graphHeight = g.graph().height || 0;

        return { laidOutNodes, laidOutEdges, graphWidth, graphHeight };
    }, [data]);

     useLayoutEffect(() => {
        if (graphWidth > 0 && graphHeight > 0) {
            const padding = 100;
            const w = graphWidth + padding * 2;
            const h = graphHeight + padding * 2;
            setViewBox({ x: -padding, y: -padding, w, h });
            initialViewBoxWidth.current = w;
        }
    }, [graphWidth, graphHeight]);

    const getSVGPoint = (clientX: number, clientY: number): { x: number; y: number } => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        return { x: svgP.x, y: svgP.y };
    };

    const handleZoom = (factor: number, clientX?: number, clientY?: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        
        const svgRect = svg.getBoundingClientRect();
        const centerX = clientX ?? svgRect.left + svgRect.width / 2;
        const centerY = clientY ?? svgRect.top + svgRect.height / 2;
        
        const point = getSVGPoint(centerX, centerY);

        const newW = viewBox.w * factor;
        const newH = viewBox.h * factor;
        
        const newX = point.x - (point.x - viewBox.x) * factor;
        const newY = point.y - (point.y - viewBox.y) * factor;

        setViewBox({ x: newX, y: newY, w: newW, h: newH });
    };

    // --- Mouse Event Handlers (Desktop) ---
    const handleMouseDown = (e: React.MouseEvent) => {
        gestureStateRef.current.isPanning = true;
        gestureStateRef.current.lastPanPoint = { x: e.clientX, y: e.clientY };
        e.currentTarget.classList.add('cursor-grabbing');
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        gestureStateRef.current.isPanning = false;
        e.currentTarget.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!gestureStateRef.current.isPanning || !svgRef.current) return;
        const svg = svgRef.current;
        const dx = e.clientX - gestureStateRef.current.lastPanPoint.x;
        const dy = e.clientY - gestureStateRef.current.lastPanPoint.y;
        const scale = viewBox.w / svg.clientWidth;
        setViewBox(prev => ({ ...prev, x: prev.x - dx * scale, y: prev.y - dy * scale }));
        gestureStateRef.current.lastPanPoint = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
        handleZoom(zoomFactor, e.clientX, e.clientY);
    };
    
    // --- Touch Event Handlers (Mobile) ---
    const getPinchDist = (touches: React.TouchList) => {
        const t1 = touches[0];
        const t2 = touches[1];
        return Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length >= 2) {
            gestureStateRef.current = {
                isPanning: false,
                isPinching: true,
                lastPanPoint: { x: 0, y: 0 },
                lastPinchDist: getPinchDist(e.touches),
            };
        } else if (e.touches.length === 1) {
            gestureStateRef.current = {
                isPanning: true,
                isPinching: false,
                lastPanPoint: { x: e.touches[0].clientX, y: e.touches[0].clientY },
                lastPinchDist: 0,
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        const { isPanning, isPinching, lastPanPoint, lastPinchDist } = gestureStateRef.current;

        if (e.touches.length >= 2 && isPinching) {
            const newDist = getPinchDist(e.touches);
            if (lastPinchDist > 0) {
                const zoomFactor = lastPinchDist / newDist;
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const pinchCenterX = (t1.clientX + t2.clientX) / 2;
                const pinchCenterY = (t1.clientY + t2.clientY) / 2;
                handleZoom(zoomFactor, pinchCenterX, pinchCenterY);
            }
            gestureStateRef.current.lastPinchDist = newDist;
        } else if (e.touches.length === 1 && isPanning) {
            const svg = svgRef.current;
            if (!svg) return;
            const touch = e.touches[0];
            const dx = touch.clientX - lastPanPoint.x;
            const dy = touch.clientY - lastPanPoint.y;
            const scale = viewBox.w / svg.clientWidth;
            setViewBox(prev => ({ ...prev, x: prev.x - dx * scale, y: prev.y - dy * scale }));
            gestureStateRef.current.lastPanPoint = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length >= 1) {
            // One finger lifted, one remains. Transition to panning.
            gestureStateRef.current = {
                isPanning: true,
                isPinching: false,
                lastPanPoint: { x: e.touches[0].clientX, y: e.touches[0].clientY },
                lastPinchDist: 0,
            };
        } else {
            // All fingers lifted, reset state.
            gestureStateRef.current = {
                isPanning: false,
                isPinching: false,
                lastPanPoint: { x: 0, y: 0 },
                lastPinchDist: 0,
            };
        }
    };


    const backdropClasses = `fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 rounded-xl w-full h-full flex flex-col border border-[var(--border-primary)] transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isDesktop ? 'shadow-[0_0_50px_-15px_var(--shadow-color-secondary)]' : 'shadow-2xl'}`;
    const currentZoom = initialViewBoxWidth.current / viewBox.w;

    return (
        <div className={backdropClasses} role="dialog" aria-modal="true">
            <div ref={panelRef} className={panelClasses}>
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-secondary)]">Flowchart</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-primary)]">
                            <button onClick={() => handleZoom(1.25)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><ZoomOutIcon className="w-6 h-6"/></button>
                            <span className="font-mono text-sm w-12 text-center text-[var(--text-secondary)] select-none">{Math.round(currentZoom*100)}%</span>
                            <button onClick={() => handleZoom(0.8)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><ZoomInIcon className="w-6 h-6"/></button>
                        </div>
                        <button onClick={handleClose} className="p-1 rounded-full hover:bg-[var(--bg-hover)]" aria-label="Close flowchart">
                            <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                        </button>
                    </div>
                </header>
                <main className="flex-grow overflow-hidden cursor-grab bg-[var(--bg-inset)]"
                      style={{ touchAction: 'none' }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onWheel={handleWheel}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                >
                    <svg ref={svgRef} width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}>
                         <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-[var(--border-secondary)]" />
                            </marker>
                        </defs>
                        <g>
                            {laidOutEdges.map((edge: any, i) => {
                                // Fallback label position to the center of the edge path, calculated by dagre.
                                let labelPos = { x: edge.x, y: edge.y };
                                
                                // For better placement, calculate the position based on the midpoint of the first segment of the edge path.
                                // This places the label closer to the decision node.
                                if (edge.points && edge.points.length > 1) {
                                    const p1 = edge.points[0];
                                    const p2 = edge.points[1];
                                    labelPos.x = (p1.x + p2.x) / 2;
                                    labelPos.y = (p1.y + p2.y) / 2;
                                }

                                return (
                                <g key={`edge-${i}`}>
                                    <path 
                                        d={`M ${edge.points.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`}
                                        className="fill-none stroke-[var(--border-secondary)]"
                                        strokeWidth="2"
                                        markerEnd="url(#arrow)"
                                    />
                                    {edge.label && (
                                        <g>
                                            <text
                                                x={labelPos.x}
                                                y={labelPos.y}
                                                dy="-6"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                stroke="var(--bg-inset)"
                                                strokeWidth="4"
                                                strokeLinejoin="round"
                                                className="font-sans"
                                                fontSize="12"
                                            >
                                                {edge.label}
                                            </text>
                                            <text
                                                x={labelPos.x}
                                                y={labelPos.y}
                                                dy="-6"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-[var(--text-secondary)] font-sans"
                                                fontSize="12"
                                            >
                                                {edge.label}
                                            </text>
                                        </g>
                                    )}
                                </g>
                                );
                            })}
                            {laidOutNodes.map(node => <FlowchartNodeComponent key={node.id} node={node} />)}
                        </g>
                    </svg>
                </main>
            </div>
        </div>
    );
};