import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스 이름을 병합하고 조건부로 적용하는 유틸리티 함수
 * @param classes 클래스 이름 또는 조건부 클래스 객체
 * @returns 병합된 클래스 이름 문자열
 */
export const cn = (...classes: Parameters<typeof clsx>) => {
  return twMerge(clsx(...classes));
};
/**
 * 조건에 맞을 시 특정 클래스명 적용 위한 유틸리티 함수
 * @param condition 조건부
 * @param className 조건에 부합할 시 적용할 클래스명
 * @returns 조건에 맞는 클래스명
 */
export const cond = (condition: boolean, className: string) =>
  condition ? className : "";
