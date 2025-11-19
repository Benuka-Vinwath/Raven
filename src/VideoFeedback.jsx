import React, { useEffect, useRef, useState } from "react";

export default function VideoFeedback() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraOn, setCameraOn] = useState(false);
  const [isMicOn, setMicOn] = useState(false);

  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

  // Fetch available devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      const audioInputs = devices.filter(d => d.kind === "audioinput");

      setCameras(videoInputs);
      setMicrophones(audioInputs);

      if (videoInputs[0]) setSelectedCamera(videoInputs[0].deviceId);
      if (audioInputs[0]) setSelectedMic(audioInputs[0].deviceId);
    });
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        audio: isMicOn && selectedMic ? { deviceId: { exact: selectedMic } } : false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setCameraOn(true);
    } catch (error) {
      console.error("Permission denied or error:", error);
      alert("Camera or microphone permission denied!");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      setCameraOn(false);
    }
  };

  const toggleMicrophone = () => {
    setMicOn(prev => !prev);
    if (isCameraOn) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Live Camera Preview</h2>

      {/* Device Selection */}
      <div style={{ marginBottom: "10px" }}>
        <label>Camera: </label>
        <select
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          {cameras.map((cam) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || `Camera ${cam.deviceId}`}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>Microphone: </label>
        <select
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
        >
          {microphones.map((mic) => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label || `Mic ${mic.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Video Preview */}
      <video
        ref={videoRef}
        muted={!isMicOn}
        style={{
          width: "300px",
          borderRadius: "12px",
          marginTop: "15px",
          background: "#000",
        }}
      />

      {/* Controls */}
      <div style={{ marginTop: "20px" }}>
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            style={{ padding: "10px 20px", marginRight: "10px" }}
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{ padding: "10px 20px", marginRight: "10px" }}
          >
            Stop Camera
          </button>
        )}

        <button
          onClick={toggleMicrophone}
          style={{ padding: "10px 20px" }}
        >
          {isMicOn ? "Disable Microphone" : "Enable Microphone"}
        </button>
      </div>
    </div>
  );
}
