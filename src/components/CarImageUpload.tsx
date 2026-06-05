import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { adminUploadCarImage } from "@/lib/admin.functions";
import { resolveCarImages } from "@/data/car-assets";

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("تعذّر قراءة الملف"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("تعذّر قراءة الملف"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("تعذّر قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

type Props = {
  password: string;
  images: string[];
  onChange: (images: string[]) => void;
};

export function CarImageUpload({ password, images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useServerFn(adminUploadCarImage);
  const [uploading, setUploading] = useState(false);
  const previews = resolveCarImages(images);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }

    setUploading(true);
    const next = [...images];
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith("image/")) {
          toast.error("اختر ملف صورة فقط");
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`حجم الصورة كبير (الحد الأقصى ${MAX_SIZE_MB} ميغابايت)`);
          continue;
        }
        const data = await readFileAsBase64(file);
        const result = await upload({
          data: {
            password,
            fileName: file.name,
            contentType: file.type,
            data,
          },
        });
        next.push(result.url);
      }
      if (next.length > images.length) {
        onChange(next);
        toast.success("تم رفع الصورة");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "فشل رفع الصورة";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={`${src}-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/70 text-white grid place-items-center hover:bg-black"
              aria-label="حذف الصورة"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary inline-flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-60"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {uploading ? "جاري الرفع" : "إضافة صورة"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        يمكنك رفع حتى {MAX_IMAGES} صور (JPG, PNG, WebP — {MAX_SIZE_MB} ميغابايت لكل صورة).
      </p>
    </div>
  );
}
