import LazyMotionProvider from "./LazyMotionProvider";
import { SuccessToastProvider } from "./ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotionProvider>
      <SuccessToastProvider>{children}</SuccessToastProvider>
    </LazyMotionProvider>
  );
}
