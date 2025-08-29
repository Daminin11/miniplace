import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [pixels, setPixels] = useState({});
  const size = 20;
  const width = 20;
  const height = 20;

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001");
    setWs(socket);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "init") {
        setPixels(data.pixels);
      } else if (data.type === "pixel") {
        setPixels(prev => ({ ...prev, [`${data.x},${data.y}`]: data.color }));
      }
    };
    return () => socket.close();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width*size, height*size);
    for (let x=0;x<width;x++){
      for (let y=0;y<height;y++){
        const key = `${x},${y}`;
        ctx.fillStyle = pixels[key] || "#FFFFFF";
        ctx.fillRect(x*size,y*size,size,size);
        ctx.strokeRect(x*size,y*size,size,size);
      }
    }
  }, [pixels]);

  const handleClick = (e) => {
    if (!ws) return;
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / size);
    const y = Math.floor((e.clientY - rect.top) / size);
    ws.send(JSON.stringify({ type:"pixel", x, y, color:"#FF0000" }));
  };

  return (
    <div>
      <h1>MiniPlace</h1>
      <canvas ref={canvasRef} width={width*size} height={height*size} onClick={handleClick}/>
    </div>
  );
}
