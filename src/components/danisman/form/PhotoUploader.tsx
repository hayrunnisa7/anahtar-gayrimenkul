"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PhotoItem {
  file: File;
  url: string;
}

const MAX_PHOTOS = 12;

export function PhotoUploader({
  onChange,
}: {
  onChange?: (info: { count: number; coverName?: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  function syncInputFiles(files: File[]) {
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  }

  // Not: onChange (parent'ın setState'i) burada her zaman handler'ın kendi
  // gövdesinde, bir setState updater'ının İÇİNDE DEĞİL çağrılır — React,
  // updater fonksiyonlarını render sırasında da çalıştırabildiği için
  // updater içinde başka bir bileşenin state'ini güncellemek uyarıya yol açar.
  function notify(next: PhotoItem[], cover: number) {
    onChange?.({ count: next.length, coverName: next[cover]?.file.name });
  }

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    const next = [
      ...photos,
      ...picked.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ].slice(0, MAX_PHOTOS);

    setPhotos(next);
    syncInputFiles(next.map((p) => p.file));
    notify(next, coverIndex);
  }

  function handleRemove(index: number) {
    URL.revokeObjectURL(photos[index].url);
    const next = photos.filter((_, i) => i !== index);
    const nextCover = coverIndex === index ? 0 : coverIndex > index ? coverIndex - 1 : coverIndex;

    setPhotos(next);
    setCoverIndex(nextCover);
    syncInputFiles(next.map((p) => p.file));
    notify(next, nextCover);
  }

  function handleSetCover(index: number) {
    setCoverIndex(index);
    notify(photos, index);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name="photos"
        accept="image/*"
        multiple
        onChange={handlePick}
        className="sr-only"
        id="photo-input"
      />
      <input type="hidden" name="coverPhotoIndex" value={coverIndex} />

      {photos.length === 0 ? (
        <label
          htmlFor="photo-input"
          className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-6 py-12 text-center transition-colors hover:border-brand-500 hover:bg-brand-50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-cream-50 shadow-sm transition-transform group-hover:scale-105">
            <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="text-sm font-semibold text-brand-900">Fotoğraf seçmek için tıklayın</span>
          <span className="max-w-xs text-xs text-foreground/55">
            Birden fazla fotoğraf birden seçebilirsiniz. Demo modunda gerçek bir sunucuya
            yüklenmez.
          </span>
          <span className="mt-1 inline-flex items-center rounded-full border border-brand-300 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm transition-colors group-hover:border-brand-500 group-hover:text-brand-900">
            Dosya Seç
          </span>
        </label>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-cream-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- yerel blob önizlemesi, next/image optimize edemez */}
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label="Fotoğrafı kaldır"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetCover(index)}
                  className={cn(
                    "absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-opacity",
                    coverIndex === index
                      ? "bg-gold-400 text-brand-950 opacity-100"
                      : "bg-black/55 text-white opacity-0 group-hover:opacity-100",
                  )}
                >
                  <Star className="h-3 w-3" fill={coverIndex === index ? "currentColor" : "none"} />
                  {coverIndex === index ? "Kapak Fotoğrafı" : "Kapak Yap"}
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label
                htmlFor="photo-input"
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/40 text-brand-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800"
              >
                <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[11px] font-medium">Ekle</span>
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-foreground/45">
            {photos.length} fotoğraf seçildi · kapak fotoğrafı yıldızla işaretlenir · demo modunda
            gerçek sunucuya yüklenmez
          </p>
        </div>
      )}
    </div>
  );
}
