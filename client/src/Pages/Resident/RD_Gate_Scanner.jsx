import { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";
import styles from "./RD_Gate_Scanner.module.css";

export default function Resident_GateScanner({ isOpen, onClose, onScanSuccess, currentStatus }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanned, setIsScanned] = useState(false);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setIsScanned(false);
    setScanError("");

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error("Failed to access camera:", error);
        alert("Unable to access camera. Please check permissions.");
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || isScanned) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Wait for video to be ready (has dimensions)
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data and scan for QR codes using jsQR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      // If QR code is detected and decoded
      if (code) {
        console.log("QR Code Detected (Raw):", code.data);
        
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(code.data);
          console.log("✓ JSON Data Extracted:", jsonData);
          console.log("JSON Keys:", Object.keys(jsonData));
          console.log("Full JSON Object:", JSON.stringify(jsonData, null, 2));
          
          setIsScanned(true);
          onScanSuccess(jsonData); // Pass parsed JSON object
        } catch (error) {
          // Not JSON, treat as plain text
          console.log("⚠ Not JSON format, treating as plain text");
          console.log("Plain Text Data:", code.data);
          
          setIsScanned(true);
          onScanSuccess(code.data); // Pass plain text
        }
      }
    };

    startCamera();

    // Scan for QR codes every 300ms
    const scanInterval = setInterval(scanQRCode, 300);

    return () => {
      clearInterval(scanInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isScanned, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Scan QR Code at Gate</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.scannerBody}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.videoStream}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className={styles.scanFrame}></div>
          <p className={styles.instruction}>Position QR code within the frame</p>
          {isScanned && <div className={styles.scanSuccess}>✓ QR Code Detected!</div>}
          {scanError && <div className={styles.scanError}>⚠ {scanError}</div>}
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.statusInfo}>
            Current Status: <span className={styles.statusBadge}>{currentStatus}</span>
          </p>
          <p className={styles.scanningStatus}>
            {isScanned ? "✓ QR code detected! Processing..." : "📷 Scanning for QR code..."}
          </p>
          <p className={styles.testInfo}>
            Test with any QR code or generate one at <a href="https://www.qr-code-generator.com/" target="_blank" rel="noopener noreferrer">qr-code-generator.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
