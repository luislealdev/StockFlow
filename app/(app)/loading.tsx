export default function Loading() {
	return (
		<div className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
			<div className="w-full max-w-6xl space-y-6">
				<div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="space-y-4">
							<div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
							<div className="h-9 w-80 max-w-full animate-pulse rounded-2xl bg-slate-200" />
							<div className="h-4 w-[32rem] max-w-full animate-pulse rounded-full bg-slate-200" />
						</div>

						<div className="h-12 w-40 animate-pulse rounded-2xl bg-slate-200" />
					</div>

					<div className="mt-8 grid gap-4 sm:grid-cols-3">
						<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
						<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
						<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
					</div>
				</div>

				<div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-6">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
						<div className="h-12 flex-1 animate-pulse rounded-2xl bg-slate-200" />
						<div className="flex gap-3">
							<div className="h-12 w-32 animate-pulse rounded-2xl bg-slate-200" />
							<div className="h-12 w-28 animate-pulse rounded-2xl bg-slate-200" />
						</div>
					</div>

					<div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
						<div className="grid grid-cols-7 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
							<div className="col-span-2 h-3 animate-pulse rounded-full bg-slate-200" />
							<div className="h-3 animate-pulse rounded-full bg-slate-200" />
							<div className="h-3 animate-pulse rounded-full bg-slate-200" />
							<div className="h-3 animate-pulse rounded-full bg-slate-200" />
							<div className="h-3 animate-pulse rounded-full bg-slate-200" />
							<div className="h-3 animate-pulse rounded-full bg-slate-200" />
						</div>

						<div className="divide-y divide-slate-200 bg-white">
							{Array.from({ length: 5 }).map((_, index) => (
								<div key={index} className="grid grid-cols-7 gap-4 px-5 py-4">
									<div className="col-span-2 h-4 animate-pulse rounded-full bg-slate-100" />
									<div className="h-4 animate-pulse rounded-full bg-slate-100" />
									<div className="h-4 animate-pulse rounded-full bg-slate-100" />
									<div className="h-4 animate-pulse rounded-full bg-slate-100" />
									<div className="h-4 animate-pulse rounded-full bg-slate-100" />
									<div className="h-4 animate-pulse rounded-full bg-slate-100" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
