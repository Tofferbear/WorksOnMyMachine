import './App.css';
import React, { useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    // Create an audio context
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // Create an analyser node
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Get the user's audio output
    //navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'system' } } })
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Create a media stream source
        const source = audioContext.createMediaStreamSource(stream);

        // Connect the source to the analyser
        source.connect(analyser);

        // Connect the analyser to the destination (not necessary for analysis, but required for audio to flow)
        analyser.connect(audioContext.destination);
      })
      .catch(error => console.error('Error getting user media:', error));

    // Draw the visualization
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const draw = () => {
      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(data);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let i = 0; i < bufferLength; i++) {
        ctx.lineTo(i * canvas.width / bufferLength, canvas.height / 2 - data[i] * canvas.height / 256);
      }
      ctx.stroke();

      requestAnimationFrame(draw);
    };
    draw();
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={200} />
  );
}

export default App;
