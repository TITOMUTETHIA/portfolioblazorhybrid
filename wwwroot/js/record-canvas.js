window.recordCanvasToWebm = async function(canvasId, seconds = 6) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.captureStream) { alert('Canvas capture not supported'); return; }
  const stream = canvas.captureStream(60);
  const mime = 'video/webm;codecs=vp9';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graffiti-loop.webm';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  recorder.start();
  await new Promise(r => setTimeout(r, seconds * 1000));
  recorder.stop();
};
