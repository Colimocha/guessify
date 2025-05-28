"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div className="text-base-content flex min-h-screen flex-col items-center justify-center">
      <div className="dark:bg-base-200 flex w-full max-w-lg flex-col items-center rounded-xl bg-white/80 p-10 shadow-xl">
        <svg
          className="text-error mb-4 h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
        <h1 className="text-error mb-2 text-3xl font-bold">
          500 - Server Incorrupted
        </h1>
        <p className="mb-6 text-center text-base text-gray-600 dark:text-gray-300">
          {"服务器遇到未知错误，请稍后重试。"}
        </p>
        <div className="flex gap-4">
          <Link href="/" className="btn btn-outline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
