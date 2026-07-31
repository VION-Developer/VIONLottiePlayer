import React, { useState, useEffect, useRef } from "react";

// Declaración global para la librería Lottie cargada vía CDN
declare global {
  interface Window {
    lottie: any;
  }
}

// Animación Lottie por defecto (Circulo pulsante con los colores del tema)
const DEFAULT_LOTTIE_JSON = {
  v: "5.7.0",
  fr: 60,
  ip: 0,
  op: 120,
  w: 300,
  h: 300,
  nm: "VION Pulse",
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Pulse Circle",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [30, 30, 100] }, { t: 120, s: [120, 120, 100] }] }
      },
      shapes: [
        {
          ty: "ellipse",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [200, 200] }
        },
        {
          ty: "st",
          c: { a: 0, k: [0, 0.968, 1, 1] }, // Cyan #00f7ff
          w: { a: 0, k: 8 }
        }
      ]
    }
  ]
};

// Componente de Tarjeta de Característica
function FeatureCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: "1 1 clamp(250px, 100%, 340px)",
        backgroundColor: isHovered ? "rgba(10, 20, 35, 0.85)" : "#0b0b0e",
        border: isHovered ? "1px solid #00f7ff" : "1px solid #1a1a20",
        borderRadius: "16px",
        padding: "24px 20px",
        textAlign: "left",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isHovered ? "0 0 30px rgba(0, 247, 255, 0.25)" : "none",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxSizing: "border-box"
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "12px", color: "#00f7ff" }}>{icon}</div>
      <h4 style={{ fontSize: "15px", fontWeight: "bold", letterSpacing: "1px", color: isHovered ? "#00f7ff" : "#ffffff", marginBottom: "8px" }}>
        {title}
      </h4>
      <p style={{ fontSize: "13px", color: "#888896", margin: 0, lineHeight: "1.5" }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function App() {
  // Estados de Reproductor y Datos
  const [lottieData, setLottieData] = useState<any>(DEFAULT_LOTTIE_JSON);
  const [fileName, setFileName] = useState("vion_default_pulse.json");
  const [fileSize, setFileSize] = useState("1.8 KB");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(120);
  const [fps, setFps] = useState(60);
  const [bgCanvasColor, setBgCanvasColor] = useState("#0a0a0d");
  const [dragActive, setDragActive] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  // Referencias DOM y Lottie Instance
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstance = useRef<any>(null);

  // 1. Cargar Script de Lottie Web vía CDN si no existe
  useEffect(() => {
    if (!window.lottie) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js";
      script.async = true;
      script.onload = () => initLottie(DEFAULT_LOTTIE_JSON);
      document.body.appendChild(script);
    } else {
      initLottie(DEFAULT_LOTTIE_JSON);
    }

    return () => {
      if (animInstance.current) animInstance.current.destroy();
    };
  }, []);

  // 2. Inicializar o Re-inicializar Lottie cuando cambia el JSON
  const initLottie = (jsonData: any) => {
    if (!containerRef.current || !window.lottie) return;

    if (animInstance.current) {
      animInstance.current.destroy();
    }

    try {
      animInstance.current = window.lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: isLooping,
        autoplay: isPlaying,
        animationData: jsonData
      });

      const frameRate = jsonData.fr || 60;
      const total = animInstance.current.totalFrames || jsonData.op || 100;
      
      setFps(frameRate);
      setTotalFrames(Math.round(total));
      animInstance.current.setSpeed(speed);

      // Evento de actualización de fotograma en tiempo real
      animInstance.current.addEventListener("enterFrame", (e: any) => {
        setCurrentFrame(Math.round(e.currentTime));
      });

    } catch (error) {
      alert("Error al procesar el archivo Lottie JSON.");
      console.error(error);
    }
  };

  // Re-inicializar cuando se carga un nuevo JSON
  useEffect(() => {
    if (window.lottie) {
      initLottie(lottieData);
    }
  }, [lottieData]);

  // Manejadores de Controles
  const togglePlay = () => {
    if (!animInstance.current) return;
    if (isPlaying) {
      animInstance.current.pause();
    } else {
      animInstance.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    if (!animInstance.current) return;
    const newLoopState = !isLooping;
    animInstance.current.loop = newLoopState;
    setIsLooping(newLoopState);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (animInstance.current) {
      animInstance.current.setSpeed(newSpeed);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseFloat(e.target.value);
    setCurrentFrame(frame);
    if (animInstance.current) {
      animInstance.current.goToAndStop(frame, true);
      setIsPlaying(false);
    }
  };

  // Carga de Archivos
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      alert("Por favor sube un archivo con formato .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedJson = JSON.parse(e.target?.result as string);
        setFileName(file.name);
        setFileSize((file.size / 1024).toFixed(1) + " KB");
        setLottieData(parsedJson);
        setIsPlaying(true);
      } catch (err) {
        alert("El archivo no contiene un JSON de Lottie válido.");
      }
    };
    reader.readAsText(file);
  };

  const durationSeconds = (totalFrames / (fps || 60)).toFixed(1);

  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      
      {/* ================= BARRA DE NAVEGACIÓN ================= */}
      <nav style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap",
        gap: "12px 20px",
        padding: "16px clamp(16px, 4vw, 60px)",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(15px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        boxSizing: "border-box"
      }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#ffffff", fontWeight: "300" }}>VION</span>
          <span style={{ backgroundColor: "rgba(0, 247, 255, 0.1)", color: "#00f7ff", border: "1px solid rgba(0, 247, 255, 0.3)", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", letterSpacing: "1px" }}>
            LOTTIE PLAYER
          </span>
        </div>

        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <a href="#studio" style={{ color: "#888896", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>Estudio</a>
          <a href="#funciones" style={{ color: "#888896", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>Características</a>
          <a href="#contacto" style={{ color: "#888896", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>Contacto</a>
          
          <a href="https://viondeveloper.com" target="_blank" rel="noreferrer" style={{ 
            backgroundColor: "transparent", 
            color: "#ffffff", 
            border: "1px solid rgba(255, 255, 255, 0.2)", 
            padding: "7px 18px", 
            borderRadius: "30px", 
            fontSize: "12px", 
            fontWeight: "600", 
            textDecoration: "none"
          }}>
            ← Volver a VION
          </a>
        </div>
      </nav>

      {/* ================= REPRODUCTOR STUDIO ================= */}
      <section id="studio" style={{ 
        position: "relative", 
        width: "100%", 
        minHeight: "100vh", 
        padding: "110px clamp(16px, 4vw, 60px) 60px",
        boxSizing: "border-box",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "bold", margin: "0 0 12px 0", letterSpacing: "-1px", color: "#ffffff" }}>
            Visualizador <span style={{ color: "#00f7ff" }}>Lottie</span> Interactivo
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 16px)", color: "#888896", maxWidth: "600px", margin: "0 auto" }}>
            Prueba, inspecciona y exporta tus animaciones JSON en tiempo real.
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "24px",
          alignItems: "start"
        }}>
          
          {/* ================= COLUMNA IZQUIERDA: CANVAS Y TIMELINE ================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Lienzo del Reproductor (Canvas) */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              style={{
                width: "100%",
                height: "clamp(350px, 48vh, 480px)",
                backgroundColor: bgCanvasColor,
                border: dragActive ? "2px dashed #00f7ff" : "1px solid #1a1a22",
                borderRadius: "24px",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                boxSizing: "border-box",
                boxShadow: dragActive ? "0 0 40px rgba(0, 247, 255, 0.25)" : "inset 0 0 20px rgba(0, 0, 0, 0.8)",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ position: "absolute", top: "20px", left: "20px", display: "flex", gap: "8px", alignItems: "center", zIndex: 10 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isPlaying ? "#00f7ff" : "#ff4444", boxShadow: isPlaying ? "0 0 8px #00f7ff" : "none" }} />
                <span style={{ fontSize: "11px", color: "#888896", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {isPlaying ? "Reproduciendo" : "Pausado"}
                </span>
              </div>

              {/* CONTENEDOR DONDE SE RENDERIZA EL SVG DE LOTTIE */}
              <div ref={containerRef} style={{ width: "100%", height: "100%", maxHeight: "360px", display: "flex", justifyContent: "center", alignItems: "center" }} />

              {/* Botón Flotante para cambiar de archivo */}
              <label style={{ 
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "#ffffff", 
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 18px", 
                borderRadius: "30px", 
                fontSize: "12px", 
                fontWeight: "600", 
                cursor: "pointer"
              }}>
                📁 Cambiar JSON
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: "none" }} 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Controles de Reproducción y Scrubber */}
            <div style={{ 
              backgroundColor: "#0b0b0e", 
              border: "1px solid #1a1a20", 
              borderRadius: "18px", 
              padding: "18px 22px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "14px" 
            }}>
              {/* Timeline Scrubber */}
              <input 
                type="range" 
                min={0} 
                max={totalFrames || 100} 
                value={currentFrame} 
                onChange={handleScrub}
                style={{
                  width: "100%",
                  accentColor: "#00f7ff",
                  cursor: "pointer"
                }}
              />

              {/* Botones */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button 
                    onClick={togglePlay} 
                    style={{ backgroundColor: "#00f7ff", border: "none", color: "#000000", width: "38px", height: "38px", borderRadius: "50%", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                  
                  <button 
                    onClick={toggleLoop} 
                    style={{ 
                      backgroundColor: isLooping ? "rgba(0, 247, 255, 0.1)" : "transparent", 
                      border: isLooping ? "1px solid #00f7ff" : "1px solid #1a1a22", 
                      color: isLooping ? "#00f7ff" : "#888896", 
                      padding: "6px 14px", 
                      borderRadius: "20px", 
                      fontSize: "12px", 
                      cursor: "pointer" 
                    }}
                  >
                    ↻ Loop
                  </button>
                </div>

                <div style={{ fontSize: "12px", color: "#888896", fontFamily: "monospace" }}>
                  Frame: <span style={{ color: "#fff" }}>{currentFrame}</span> / {totalFrames} ({durationSeconds}s)
                </div>
              </div>
            </div>

          </div>


          {/* ================= COLUMNA DERECHA: PANEL DE CONFIGURACIÓN ================= */}
          <div style={{ 
            backgroundColor: "#0b0b0e", 
            border: "1px solid #1a1a20", 
            borderRadius: "24px", 
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff", borderBottom: "1px solid #1a1a20", paddingBottom: "12px", margin: 0 }}>
              Ajustes de Animación
            </h3>

            {/* Velocidad */}
            <div>
              <label style={{ fontSize: "12px", color: "#888896", display: "block", marginBottom: "8px" }}>Velocidad de Reproducción</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => handleSpeedChange(s)}
                    style={{ 
                      flex: 1, 
                      backgroundColor: speed === s ? "rgba(0, 247, 255, 0.15)" : "#050508", 
                      color: speed === s ? "#00f7ff" : "#888896", 
                      border: speed === s ? "1px solid #00f7ff" : "1px solid #1a1a20", 
                      padding: "8px", 
                      borderRadius: "10px", 
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer" 
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Cambiador de Fondo */}
            <div>
              <label style={{ fontSize: "12px", color: "#888896", display: "block", marginBottom: "8px" }}>Fondo del Canvas</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {[
                  { name: "Oscuro", color: "#0a0a0d" },
                  { name: "Negro", color: "#000000" },
                  { name: "Gris", color: "#1f1f28" },
                  { name: "Blanco", color: "#ffffff" }
                ].map((bg, i) => (
                  <button 
                    key={i} 
                    onClick={() => setBgCanvasColor(bg.color)}
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      backgroundColor: bg.color, 
                      border: bgCanvasColor === bg.color ? "2px solid #00f7ff" : "1px solid #333",
                      cursor: "pointer"
                    }} 
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* Detalles Técnicos del Inspector */}
            <div style={{ backgroundColor: "#050508", border: "1px solid #1a1a20", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "#00f7ff", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                Inspector de Archivo
              </div>
              <div style={{ fontSize: "13px", color: "#888896", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Archivo:</span> <span style={{ color: "#fff", fontWeight: "600" }}>{fileName}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tamaño:</span> <span style={{ color: "#fff" }}>{fileSize}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>FPS:</span> <span style={{ color: "#fff" }}>{fps} FPS</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Versión Lottie:</span> <span style={{ color: "#fff" }}>v{lottieData.v || "5.0+"}</span></div>
              </div>
            </div>

            {/* Botón Obtener Embed */}
            <button 
              onClick={() => setShowEmbedModal(true)}
              style={{ 
                width: "100%", 
                backgroundColor: "#00f7ff", 
                color: "#000000", 
                border: "none", 
                borderRadius: "30px", 
                padding: "12px", 
                fontWeight: "700", 
                fontSize: "14px", 
                cursor: "pointer",
                boxShadow: "0 0 25px rgba(0, 247, 255, 0.2)"
              }}
            >
              Obtener Código Embed / HTML
            </button>

          </div>

        </div>

      </section>


      {/* ================= MODAL GENERADOR DE EMBED ================= */}
      {showEmbedModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#0b0b0e",
            border: "1px solid #00f7ff",
            borderRadius: "20px",
            padding: "28px",
            maxWidth: "550px",
            width: "100%",
            boxShadow: "0 0 40px rgba(0, 247, 255, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Código Embed HTML</h3>
              <button onClick={() => setShowEmbedModal(false)} style={{ background: "none", border: "none", color: "#888", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            
            <p style={{ fontSize: "13px", color: "#888896", marginBottom: "16px" }}>
              Copia este código para incrustar el reproductor en cualquier sitio web:
            </p>

            <pre style={{
              backgroundColor: "#050508",
              border: "1px solid #1a1a20",
              padding: "14px",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#00f7ff",
              overflowX: "auto",
              whiteSpace: "pre-wrap"
            }}>
{`<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<div id="lottie-container" style="width: 300px; height: 300px;"></div>
<script>
   lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',
    loop: ${isLooping},
    autoplay: true,
    path: 'TU_RUTA_AL_ARCHIVO/${fileName}'
  });
</script>`}
            </pre>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>\n<div id="lottie-container" style="width: 300px; height: 300px;"></div>`);
                alert("¡Código copiado al portapapeles!");
              }}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "30px",
                padding: "10px",
                fontWeight: "bold",
                marginTop: "16px",
                cursor: "pointer"
              }}
            >
              Copiar al Portapapeles
            </button>
          </div>
        </div>
      )}


      {/* ================= CARACTERÍSTICAS DE LA EXTENSIÓN ================= */}
      <section id="funciones" style={{ padding: "80px clamp(16px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto", textAlign: "center", borderTop: "1px solid #111116", boxSizing: "border-box" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#a3aaaa", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
          Herramientas
        </h3>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "bold", marginBottom: "12px", color: "#ffffff" }}>
          Diseñado para Desarrolladores
        </h2>
        <p style={{ color: "#888896", fontSize: "14px", marginBottom: "40px" }}>
          Control total sobre tus animaciones vectoriales.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <FeatureCard icon="🚀" title="Carga Ultra Rápida" subtitle="Procesamiento local instantáneo sin subir tus archivos a ningún servidor." />
          <FeatureCard icon="📊" title="Análisis de Frames" subtitle="Inspector en tiempo real para contar fotogramas, FPS y versión del archivo." />
          <FeatureCard icon="🎛️" title="Control de Tiempo" subtitle="Avanza o retrocede con el timeline interactivo fotograma por fotograma." />
        </div>
      </section>

 <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#a3aaaa", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
          Comentarios
        </h3>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "bold", marginBottom: "12px", color: "#ffffff" }}>
          ¿Dudas o sugerencias?
        </h2>
        <p style={{ color: "#888896", fontSize: "14px", marginBottom: "40px" }}>
          ¿Tienes alguna pregunta o sugerencia? Nos encantaría saber de ti.
        </p> <div style={{ marginBottom: "100px" }}> </div>

        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            formData.append("access_key", "9fcd2b5e-ad86-4650-b113-1be319b0546e");

            const response = await fetch("https://api.web3forms.com/submit", {
              method: "POST",
              body: formData
            });

            const data = await response.json();
            if (data.success) {
              alert("¡Mensaje enviado con éxito! Te responderé pronto.");
              form.reset();
            } else {
              alert("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
            }
          }}
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            textAlign: "left",
            boxSizing: "border-box"
          }}
        >
          <input type="text" name="name" placeholder="Tu Nombre" required style={{ width: "100%", backgroundColor: "#0b0b0e", border: "1px solid #1a1a20", borderRadius: "12px", padding: "14px 18px", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          <input type="email" name="email" placeholder="Tu Correo Electrónico" required style={{ width: "100%", backgroundColor: "#0b0b0e", border: "1px solid #1a1a20", borderRadius: "12px", padding: "14px 18px", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          <textarea name="message" placeholder="Escribe tu mensaje o detalles de tu proyecto..." rows={4} required style={{ width: "100%", backgroundColor: "#0b0b0e", border: "1px solid #1a1a20", borderRadius: "12px", padding: "14px 18px", color: "#ffffff", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          <button type="submit" style={{ width: "100%", backgroundColor: "#00f7ff", color: "#000000", border: "none", borderRadius: "30px", padding: "14px", fontWeight: "700", fontSize: "15px", cursor: "pointer", boxShadow: "0 0 25px rgba(0, 247, 255, 0.3)", boxSizing: "border-box" }}>
            Enviar Mensaje
          </button>
        </form>




      {/* ================= FOOTER ================= */}
      <footer style={{ padding: "40px 20px", borderTop: "1px solid #111116", textAlign: "center", color: "#555560", fontSize: "13px" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "-0.5px", marginBottom: "12px", color: "#fff" }}>
          <span>VION</span> <span style={{ color: "#00f7ff", fontWeight: "300" }}>Lottie Player</span>
        </div>
        © {new Date().getFullYear()} VION Developer Extension. Todos los derechos reservados.
      </footer>

    </div>
  );
}