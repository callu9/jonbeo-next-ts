export default function NotFound() {
	return (
		<div className="h-screen flex justify-center">
			<div className="flex flex-col gap-4 items-center justify-center">
				<h2 className="text-xl">페이지를 찾을 수 없습니다.</h2>
				<button className="rounded-md bg-black text-white py-2 px-6">
					<a href="/">돌아가기</a>
				</button>
			</div>
		</div>
	);
}
