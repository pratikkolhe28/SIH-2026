import React, { useEffect, useRef, useState } from "react";
import { Camera, SwitchCamera, X, AlertCircle } from "lucide-react";

export default function CameraModal({ isOpen, onClose, onCapturePhoto }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // back camera by default for plants
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera init failed:", err);
      setErrorMsg("Unable to access camera. Please allow camera permissions or upload a file directly.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleToggleFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `farmer_leaf_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapturePhoto(file);
          onClose();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: "600px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera size={20} className="text-emerald-400" />
            <span>Photograph Diseased Leaf</span>
          </h3>
          <button type="button" className="btn-icon-pill" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMsg ? (
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: "#fff" }}>Camera Permission Needed</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#000",
              aspectRatio: "4/3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Viewfinder crosshairs */}
            <div
              style={{
                position: "absolute",
                border: "2px dashed rgba(52, 211, 153, 0.6)",
                width: "70%",
                height: "70%",
                borderRadius: "12px",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleToggleFacing}
            title="Switch Front/Back Camera"
            disabled={!!errorMsg}
          >
            <SwitchCamera size={18} />
            <span>Switch Lens</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSnap}
            disabled={!!errorMsg}
            id="btn-camera-capture"
            style={{ padding: "0.85rem 2rem" }}
          >
            <Camera size={20} />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
