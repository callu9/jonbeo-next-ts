export default function NotFound() {
  return (
    <div className="flex-center h-screen">
      <div className="flex-center flex-col gap-4">
        <h2 className="text-xl">페이지를 찾을 수 없습니다.</h2>
        <button className="dark:text-background dark:bg-foreground rounded-md bg-black px-6 py-2 text-white">
          <a href="/">돌아가기</a>
        </button>
      </div>
    </div>
  );
}
