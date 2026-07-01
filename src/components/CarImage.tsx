import Image from "next/image";
import { carImageUrl } from "@/lib/images";

interface CarImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function CarImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 400px",
}: CarImageProps) {
  const optimized = carImageUrl(src, fill ? 400 : width ?? 320);

  if (fill) {
    return (
      <Image
        src={optimized}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={optimized}
      alt={alt}
      width={width ?? 320}
      height={height ?? 200}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
