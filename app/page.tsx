'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

// Kamus bahasa untuk terjemahan
const translations = {
  en: {
    title: 'Media Optimizer',
    subtitle: 'High-precision compression. Reduce file size significantly while maintaining original resolution and sharpness.',
    tabImage: 'Image',
    tabVideo: 'Video',
    uploadLabel: 'Upload File',
    levelLabel: 'Compression Parameters',
    btnCompress: 'Execute Compression',
    btnCompressing: 'Processing...',
    previewTitle: 'Result Preview',
    efficiency: 'Storage efficiency:',
    originalData: 'Original Data',
    compressedData: 'Processed Result',
    btnDownload: 'Download File',
    donate: 'Support',
    errorNoFile: 'Please select a file first.',
    errorProcess: 'An error occurred: ',
    warningCPU: "This process takes time and uses your device's CPU. Please do not close this page.",
    loadingEngine: 'Loading video compression engine...',
    errorEngineLoading: 'Compression engine is loading, please wait a moment.',
    scanQR: 'Scan Saweria QR',
    openWeb: 'Open in Browser'
  },
  id: {
    title: 'Pengoptimal Media',
    subtitle: 'Kompresi presisi tinggi. Mengurangi ukuran file secara signifikan dengan mempertahankan resolusi dan ketajaman asli.',
    tabImage: 'Foto',
    tabVideo: 'Video',
    uploadLabel: 'Unggah Berkas',
    levelLabel: 'Parameter Kompresi',
    btnCompress: 'Eksekusi Kompresi',
    btnCompressing: 'Memproses...',
    previewTitle: 'Pratinjau Hasil',
    efficiency: 'Efisiensi penyimpanan:',
    originalData: 'Data Asli',
    compressedData: 'Hasil Pemrosesan',
    btnDownload: 'Unduh Berkas',
    donate: 'Dukung Kami',
    errorNoFile: 'Pilih berkas terlebih dahulu.',
    errorProcess: 'Terjadi kesalahan: ',
    warningCPU: 'Proses ini memakan waktu dan menggunakan CPU perangkat Anda. Jangan tutup halaman ini.',
    loadingEngine: 'Memuat mesin kompresi video...',
    errorEngineLoading: 'Mesin kompresi sedang dimuat, tunggu sebentar.',
    scanQR: 'Scan QR Saweria',
    openWeb: 'Buka via Web'
  }
};

export default function Home() {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const t = translations[lang];

  // State untuk Tab Mode
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  
  // State untuk Pop-up Donasi
  const [showDonate, setShowDonate] = useState(false);

  // ================= STATE FOTO =================
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgOriginalUrl, setImgOriginalUrl] = useState<string | null>(null);
  const [imgCompressedUrl, setImgCompressedUrl] = useState<string | null>(null);
  const [imgOriginalSize, setImgOriginalSize] = useState(0);
  const [imgCompressedSize, setImgCompressedSize] = useState(0);
  const [imgLevel, setImgLevel] = useState('normal');
  const [isImgCompressing, setIsImgCompressing] = useState(false);

  // ================= STATE VIDEO =================
  const [vidFile, setVidFile] = useState<File | null>(null);
  const [vidOriginalUrl, setVidOriginalUrl] = useState<string | null>(null);
  const [vidCompressedUrl, setVidCompressedUrl] = useState<string | null>(null);
  const [vidOriginalSize, setVidOriginalSize] = useState(0);
  const [vidCompressedSize, setVidCompressedSize] = useState(0);
  const [isVidCompressing, setIsVidCompressing] = useState(false);
  const [vidProgress, setVidProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffmpegRef = useRef<any>(null);

  // Load FFmpeg saat tab video dibuka
  useEffect(() => {
    if (activeTab === 'video' && !ffmpegLoaded) {
      loadFFmpeg();
    }
  }, [activeTab]);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on('progress', ({ progress }) => {
        setVidProgress(Math.round(progress * 100));
      });
      await ffmpeg.load();
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Gagal memuat FFmpeg:", err);
    }
  };

  // ================= HANDLER FOTO =================
  const handleImgChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgOriginalSize(Number((file.size / 1024).toFixed(2)));
      setImgOriginalUrl(URL.createObjectURL(file));
      setImgCompressedUrl(null);
    }
  };

  const handleCompressImg = async () => {
    if (!imgFile) return alert(t.errorNoFile);
    setIsImgCompressing(true);
    const formData = new FormData();
    formData.append('image', imgFile);
    formData.append('level', imgLevel);

    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal memproses gambar / Failed to process image');

      const blob = await response.blob();
      setImgCompressedSize(Number((blob.size / 1024).toFixed(2)));
      setImgCompressedUrl(URL.createObjectURL(blob));
    } catch (error: any) {
      alert(t.errorProcess + error.message);
    } finally {
      setIsImgCompressing(false);
    }
  };

  const handleDownloadImg = () => {
    if (!imgCompressedUrl || !imgFile) return;
    const fileExt = imgFile.name.split('.').pop();
    const fileName = imgFile.name.replace(`.${fileExt}`, '');
    const a = document.createElement('a');
    a.href = imgCompressedUrl;
    a.download = `${fileName}-compressed.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ================= HANDLER VIDEO =================
  const handleVidChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setVidFile(file);
      setVidOriginalSize(Number((file.size / (1024 * 1024)).toFixed(2))); // MB
      setVidOriginalUrl(URL.createObjectURL(file));
      setVidCompressedUrl(null);
      setVidProgress(0);
    }
  };

  const handleCompressVid = async () => {
    if (!vidFile) return alert(t.errorNoFile);
    if (!ffmpegLoaded) return alert(t.errorEngineLoading);
    
    setIsVidCompressing(true);
    setVidProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Tulis file ke memori browser
      await ffmpeg.writeFile('input.mp4', await fetchFile(vidFile));
      
      // Eksekusi kompresi: resolusi max lebar 720p, frame rate 30, CRF 28 (optimal)
      await ffmpeg.exec([
        '-i', 'input.mp4', 
        '-vcodec', 'libx264', 
        '-crf', '28', 
        '-preset', 'fast',
        '-vf', 'scale=-2:720', 
        '-r', '30',
        'output.mp4'
      ]);

      // Ambil hasilnya
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      
      setVidCompressedSize(Number((blob.size / (1024 * 1024)).toFixed(2))); // MB
      setVidCompressedUrl(URL.createObjectURL(blob));

    } catch (error: any) {
      alert(t.errorProcess + error.message);
    } finally {
      setIsVidCompressing(false);
    }
  };

  const handleDownloadVid = () => {
    if (!vidCompressedUrl || !vidFile) return;
    const fileName = vidFile.name.split('.')[0];
    const a = document.createElement('a');
    a.href = vidCompressedUrl;
    a.download = `${fileName}-compressed.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Kalkulasi persentase
  const imgSavedPercentage = imgCompressedSize ? (100 - (imgCompressedSize / imgOriginalSize) * 100).toFixed(1) : 0;
  const vidSavedPercentage = vidCompressedSize ? (100 - (vidCompressedSize / vidOriginalSize) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-slate-200 relative pb-20 md:pb-0">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-12 pb-10 text-center px-4 relative">
        <div className="absolute top-4 right-4 flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setLang('en')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
          <button onClick={() => setLang('id')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${lang === 'id' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}>ID</button>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mt-6 md:mt-0">{t.title}</h1>
        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">{t.subtitle}</p>

        {/* TAB SWITCHER */}
        <div className="mt-8 flex justify-center">
          <div className="flex bg-gray-100 p-1 rounded-xl w-64">
            <button onClick={() => setActiveTab('image')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'image' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}>
              📷 {t.tabImage}
            </button>
            <button onClick={() => setActiveTab('video')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'video' ? 'bg-white shadow-sm text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}>
              🎥 {t.tabVideo}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* ==================== TAB FOTO ==================== */}
        {activeTab === 'image' && (
          <div className="animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 mb-10">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.uploadLabel} (JPG/PNG)</label>
                  <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImgChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-gray-200 rounded-lg cursor-pointer" />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.levelLabel}</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['low', 'normal', 'high'].map((lvl) => (
                      <button key={lvl} onClick={() => setImgLevel(lvl)} className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${imgLevel === lvl ? 'bg-white shadow-sm text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              </div>
              {imgFile && (
                <div className="mt-8 text-center">
                  <button onClick={handleCompressImg} disabled={isImgCompressing} className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-all w-full md:w-auto ${isImgCompressing ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900'}`}>
                    {isImgCompressing ? t.btnCompressing : t.btnCompress}
                  </button>
                </div>
              )}
            </div>

            {imgCompressedUrl && (
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-800">{t.previewTitle}</h2>
                  <p className="text-emerald-600 font-medium mt-1 text-sm">{t.efficiency} {imgSavedPercentage}%</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-600 mb-3 border border-gray-200">{t.originalData} ({imgOriginalSize} KB)</span>
                    <div className="w-full h-48 md:h-80 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                      <img src={imgOriginalUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="bg-emerald-50 px-3 py-1 rounded-md text-xs font-semibold text-emerald-700 mb-3 border border-emerald-200">{t.compressedData} ({imgCompressedSize} KB)</span>
                    <div className="w-full h-48 md:h-80 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                      <img src={imgCompressedUrl} alt="Compressed" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button onClick={handleDownloadImg} className="px-8 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 mx-auto">{t.btnDownload}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB VIDEO ==================== */}
        {activeTab === 'video' && (
          <div className="animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 mb-10">
              
              {!ffmpegLoaded && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium animate-pulse text-center">
                  {t.loadingEngine}
                </div>
              )}

              <div className="flex flex-col items-center">
                <div className="w-full md:w-2/3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.uploadLabel} (MP4/MOV)</label>
                  <input type="file" accept="video/mp4, video/mov" onChange={handleVidChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-gray-200 rounded-lg cursor-pointer" />
                </div>
              </div>

              {vidFile && (
                <div className="mt-8 text-center">
                  <button onClick={handleCompressVid} disabled={isVidCompressing || !ffmpegLoaded} className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-all w-full md:w-auto relative overflow-hidden ${isVidCompressing || !ffmpegLoaded ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900'}`}>
                    {/* Progress Bar Background */}
                    {isVidCompressing && (
                      <div className="absolute top-0 left-0 h-full bg-emerald-500 opacity-30 transition-all duration-300" style={{ width: `${vidProgress}%` }}></div>
                    )}
                    <span className="relative z-10">
                      {isVidCompressing ? `${t.btnCompressing} ${vidProgress}%` : t.btnCompress}
                    </span>
                  </button>
                  {isVidCompressing && <p className="mt-3 text-xs text-gray-500">{t.warningCPU}</p>}
                </div>
              )}
            </div>

            {vidCompressedUrl && (
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-800">{t.previewTitle}</h2>
                  <p className="text-emerald-600 font-medium mt-1 text-sm">{t.efficiency} {vidSavedPercentage}%</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-semibold text-gray-600 mb-3 border border-gray-200">{t.originalData} ({vidOriginalSize} MB)</span>
                    <video src={vidOriginalUrl!} controls className="w-full h-auto rounded-lg border border-gray-200" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="bg-emerald-50 px-3 py-1 rounded-md text-xs font-semibold text-emerald-700 mb-3 border border-emerald-200">{t.compressedData} ({vidCompressedSize} MB)</span>
                    <video src={vidCompressedUrl} controls className="w-full h-auto rounded-lg border border-gray-200" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button onClick={handleDownloadVid} className="px-8 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 mx-auto">{t.btnDownload}</button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FLOATING DONATE BUTTON & QR POPUP */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Modal/Pop-up QR Code */}
        {showDonate && (
          <div className="mb-4 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 text-center w-48 transition-all animate-fade-in-up">
            <p className="text-sm font-semibold text-gray-800 mb-2">{t.scanQR}</p>
            
            {/* Tempat Gambar QR Code */}
            <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-3 flex items-center justify-center">
              <img 
                src="/qr-saweria.png" 
                alt="QR Code Saweria" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <a 
              href="https://saweria.co/faishalnr22" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-slate-900 text-white text-xs font-medium py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              {t.openWeb}
            </a>
          </div>
        )}

        {/* Tombol Utama */}
        <button 
          onClick={() => setShowDonate(!showDonate)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-3 md:px-5 md:py-3 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center gap-2 border border-slate-700"
          title={t.donate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
            <line x1="6" y1="2" x2="6" y2="4"></line>
            <line x1="10" y1="2" x2="10" y2="4"></line>
            <line x1="14" y1="2" x2="14" y2="4"></line>
          </svg>
          <span className="hidden md:inline text-sm font-medium">{t.donate}</span>
        </button>
      </div>

    </div>
  );
}