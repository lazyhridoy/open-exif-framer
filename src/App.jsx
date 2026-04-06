import { useState, useRef } from 'react';
import EXIF from 'exif-js';
import html2canvas from 'html2canvas';

export default function App() {
  const [image, setImage] = useState(null);
  const [padding, setPadding] = useState('p-10'); // Default "Medium" border
  const [exif, setExif] = useState({
    camera: 'READY TO FRAME',
    lens: 'Upload a photo to see lens data',
    settings: 'ISO -- • f/-- • --s'
  });

  // This is the "Laser Pointer" that tells the downloader what to grab
  const frameRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create the temporary link for the browser to show the image
    setImage(URL.createObjectURL(file));

    // The EXIF Engine
    EXIF.getData(file, function() {
      const make = EXIF.getTag(this, "Make") || "";
      const model = EXIF.getTag(this, "Model") || "CAMERA";
      const fstop = EXIF.getTag(this, "FNumber") || "--";
      const iso = EXIF.getTag(this, "ISOSpeedRatings") || "--";
      const focal = EXIF.getTag(this, "FocalLength") || "--";
      const exposure = EXIF.getTag(this, "ExposureTime");

      let shutter = "--";
      if (exposure) {
        shutter = exposure >= 1 ? exposure : `1/${Math.round(1/exposure)}`;
      }

      setExif({
        camera: `${make} ${model}`.trim().toUpperCase(),
        lens: `${focal}mm Lens`,
        settings: `ISO ${iso} • f/${fstop} • ${shutter}s`
      });
    });
  };

  const handleDownload = async () => {
    if (!frameRef.current) return;
    
    // High-quality screenshot of just the 'frameRef' div
    const canvas = await html2canvas(frameRef.current, { 
      scale: 3, // 3x Resolution for Instagram
      useCORS: true,
      backgroundColor: '#ffffff' 
    });
    
    const link = document.createElement('a');
    link.download = `EXIF-Frame-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR: Controls */}
      <div className="w-full md:w-80 p-8 border-r border-white/10 flex flex-col gap-10 bg-[#111]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tighter">OPEN EXIF</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-1">Framer v1.0</p>
        </div>

        {/* Upload Action */}
        <label className="w-full py-10 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-blue-500 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Select Image</span>
          <input type="file" accept="image/jpeg" className="hidden" onChange={handleUpload} />
        </label>

        {/* Style Controls */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Border Style</p>
          <div className="grid grid-cols-3 gap-2">
            {['p-6', 'p-10', 'p-16'].map((p, i) => (
              <button 
                key={p} 
                onClick={() => setPadding(p)}
                className={`py-2 rounded-lg text-[10px] font-bold transition-all ${padding === p ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
              >
                {i === 0 ? 'SLIM' : i === 1 ? 'REG' : 'WIDE'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleDownload}
          disabled={!image}
          className="mt-auto py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-blue-500 hover:text-white disabled:opacity-20 transition-all shadow-xl shadow-black"
        >
          Export JPEG
        </button>
      </div>

      {/* MAIN: The Canvas */}
      <div className="flex-1 p-6 md:p-20 flex items-center justify-center bg-[#070707] overflow-auto">
        
        {/* THE FRAME: This is the exact piece that gets saved */}
        <div 
          ref={frameRef} 
          className={`bg-white inline-block transition-all duration-500 shadow-2xl ${padding}`}
          style={{ minWidth: '400px' }}
        >
          {/* Image Layer */}
          <div className="bg-slate-50 relative flex items-center justify-center overflow-hidden">
            {image ? (
              <img src={image} alt="Preview" className="max-w-full max-h-[65vh] block" />
            ) : (
              <div className="w-[500px] h-[350px] flex items-center justify-center border border-slate-100">
                <p className="text-slate-200 uppercase tracking-[0.5em] text-[10px]">No Asset Loaded</p>
              </div>
            )}
          </div>

          {/* Metadata Layer */}
          <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-6">
            <div className="space-y-1">
              <h2 className="text-black font-black text-sm md:text-lg tracking-tighter leading-none">{exif.camera}</h2>
              <p className="text-slate-400 font-medium text-[10px] md:text-xs tracking-tight">{exif.lens}</p>
            </div>
            <div className="text-right">
              <p className="inline-block bg-slate-900 text-white font-mono text-[9px] md:text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">
                {exif.settings}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}