import Image from "next/image";

type AlifLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AlifLogo({ compact = false, className }: AlifLogoProps) {
  return (
    <Image
      alt="ALIF"
      className={className}
      height={compact ? 40 : 48}
      priority
      src={compact ? "/brand/alif-mark.svg" : "/brand/alif-lockup.svg"}
      width={compact ? 40 : 165}
    />
  );
}
