import { cn } from "@/utils/classNames";
import IconButton from "./IconButton";

export default function GraphHandle() {
  return (
    <div className="absolute top-[45%] w-full">
      <div className="flex-center relative">
        <hr className="w-full border-[1px] border-dashed" />
        <div
          className={cn(
            "absolute right-6 h-10 w-10",
            "drop-shadow-[0_4px_6px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_4px_6px_rgba(100,100,100,0.2)]"
          )}
        >
          <IconButton iconNm="adjust" />
        </div>
      </div>
    </div>
  );
}
