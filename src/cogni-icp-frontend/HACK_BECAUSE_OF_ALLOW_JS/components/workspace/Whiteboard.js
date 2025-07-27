import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
const Whiteboard = ({ workspaceId, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [elements, setElements] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const socket = useSocket();
    useEffect(() => {
        if (socket) {
            // Mock joining workspace
            socket.emit('join_workspace', { workspace_id: workspaceId });
            // Mock receiving updates
            socket.on('workspace_update', (update) => {
                setElements(update.elements);
                drawElements(update.elements);
            });
            return () => {
                socket.emit('leave_workspace', { workspace_id: workspaceId });
            };
        }
    }, [socket, workspaceId]);
    const drawElements = (elementsToRender) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elementsToRender.forEach(element => {
            if (element.type === 'path' && element.points) {
                ctx.beginPath();
                ctx.strokeStyle = element.color;
                ctx.lineWidth = element.width;
                element.points.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    }
                    else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
            }
        });
    };
    const handleMouseDown = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPath([{ x, y }]);
    };
    const handleMouseMove = (e) => {
        if (!isDrawing)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const newPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setCurrentPath(prev => [...prev, newPoint]);
        // Mock emitting update
        if (socket) {
            socket.emit('workspace_update', {
                workspace_id: workspaceId,
                type: 'draw',
                content: { point: newPoint }
            });
        }
        // Draw the current stroke
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.moveTo(currentPath[currentPath.length - 2]?.x || newPoint.x, currentPath[currentPath.length - 2]?.y || newPoint.y);
        ctx.lineTo(newPoint.x, newPoint.y);
        ctx.stroke();
    };
    const handleMouseUp = () => {
        setIsDrawing(false);
        if (currentPath.length > 0) {
            const newElement = {
                type: 'path',
                points: currentPath,
                color: '#000',
                width: 2
            };
            setElements(prev => [...prev, newElement]);
        }
        setCurrentPath([]);
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Collaborative Whiteboard
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Close
          </button>
        </div>
        <canvas ref={canvasRef} width={800} height={600} className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}/>
      </div>
    </div>);
};
export default Whiteboard;
