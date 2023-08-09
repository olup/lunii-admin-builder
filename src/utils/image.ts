export async function resizeImage(
  blob: Blob,
  width: number,
  height: number
): Promise<Blob> {
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const ctx = offscreenCanvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get context");

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      const scale = Math.max(width / imgWidth, height / imgHeight);
      const newWidth = imgWidth * scale;
      const newHeight = imgHeight * scale;
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      console.log(offscreenCanvas);
      offscreenCanvas.convertToBlob().then((canvasBlob) => {
        resolve(canvasBlob);
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
