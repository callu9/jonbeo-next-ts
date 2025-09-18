import { useUnitStore } from "@/store/unitStore";
import { cn, cond } from "@/utils/classNames";

export default function UnitButton() {
  const { isWon = false, setUnitToWon, setUnitToDollar } = useUnitStore();

  return (
    <button
      className="flex overflow-hidden rounded-lg bg-gray-300 text-white dark:border dark:border-gray-200 dark:bg-transparent"
      onClick={isWon ? setUnitToDollar : setUnitToWon}
    >
      <div className={cn("w-8 px-2 py-1", cond(isWon, "bg-gray-400 dark:bg-gray-700"))}>₩</div>
      <div className={cn("w-8 px-2 py-1", cond(!isWon, "bg-gray-400 dark:bg-gray-700"))}>$</div>
    </button>
  );
}
