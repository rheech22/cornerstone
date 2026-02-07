import { cn } from "../lib/cn";

export const Fonts = () => {
  return (
    <div className={cn("my-10 w-full border-1 border-black/20 p-4")}>
      <h1 className={cn("text-4xl font-bold")}>Font 폰트</h1>
      <p>Mixed: English와 한국어가 함께 사용됩니다.</p>
      <p>
        <span>This is a regular English text and </span>
        <span> 이것은 보통 한국어 문장입니다.</span>
      </p>
      <p className={cn("text-2xl font-bold")}>
        <span>This is a bold English text and </span>
        <span>굵은</span> 한국어 텍스트.
      </p>
      <p className={cn("text-xl font-semibold")}>
        <span>This is a semi-bold English sentence.</span>
        <span> 이것은 세미볼드 한국어 문장입니다.</span>
      </p>
      <p className={cn("font-light")}>
        <span>This is a light English sentence.</span>
        <span> 이것은 라이트 한국어 문장입니다.</span>
      </p>
      <p className={cn("italic")}>
        <span>This is an italic English sentence.</span>
        <span>이탤릭 한국어 문장입니다.</span>
      </p>
      <p className={cn("font-semibold italic")}>
        <span>This is a semi-bold italic English sentence.</span>
        <span> 중간 굵기의 이탤릭 한국어 문장입니다.</span>
      </p>
      <p className={cn("font-bold italic")}>
        <span>This is a bold italic English sentence.</span>
        <span> 굵은 이탤릭 한국어 문장입니다.</span>
      </p>
    </div>
  );
};
