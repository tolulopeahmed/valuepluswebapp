"use client";

import "react-easy-crop/react-easy-crop.css";
import Cropper, { type Area } from "react-easy-crop";
import { useCallback, useState } from "react";
import Modal from "./Modal";
import Button from "./buttons/buttons";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Could not load image")));
    img.src = src;
  });
}

// Same recipe as AvatarCropModal/IDDocumentCropModal — duplicated rather
// than shared since each crop shape (round avatar, rectangular document,
// book-cover aspect) is otherwise unrelated UI.
async function getCroppedImageBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export image."))),
      "image/jpeg",
      0.92,
    );
  });
}

interface BookCoverCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (blob: Blob) => Promise<void>;
}

// Same 3:4.4 aspect BookCover itself renders at (see useMyBooks.tsx) —
// cropping to that ratio up front means the uploaded image already fits
// the cover tile everywhere it's shown, no separate cropping per surface.
export default function BookCoverCropModal({
  open,
  imageSrc,
  onClose,
  onSave,
}: BookCoverCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      await onSave(blob);
    } finally {
      setSaving(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-1 text-center text-[1.05rem] font-black text-white">
        Crop your cover
      </h3>
      <p className="mb-4 text-center text-[0.76rem] text-white/45">
        Drag to reposition, use the slider to zoom.
      </p>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black/40">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4.4}
          cropShape="rect"
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <input
        type="range"
        min={1}
        max={3}
        step={0.01}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="mt-4 w-full"
        style={{ accentColor: "rgb(var(--vp-accent-rgb))" }}
        aria-label="Zoom"
      />

      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={handleSave}
          disabled={!croppedAreaPixels}
          loading={saving}
        >
          {saving ? "Saving…" : "Use this cover"}
        </Button>
      </div>
    </Modal>
  );
}
