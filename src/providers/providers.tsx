import LazyMotionProvider from "./LazyMotionProvider";
import { MSWComponent } from "./MSWComponent";
import { SuccessToastProvider } from "./ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotionProvider>
      <MSWComponent>
        <SuccessToastProvider>{children}</SuccessToastProvider>
      </MSWComponent>
    </LazyMotionProvider>
  );
}
