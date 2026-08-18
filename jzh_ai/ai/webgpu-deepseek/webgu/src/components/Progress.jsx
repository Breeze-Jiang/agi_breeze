function formatBytes(size) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export default function Progress({ text, percentage, total }) {
  const normalizedPercentage = Number.isFinite(percentage)
    ? Math.min(100, Math.max(0, percentage))
    : 0;
  const hasKnownTotal = Number.isFinite(total) && total > 0;

  return (
    <div
      className="relative w-full h-5 bg-gray-100 dark:bg-gray-700 text-left rounded-lg overflow-hidden mb-0.5"
      role="progressbar"
      aria-label={`${text} download progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={hasKnownTotal ? normalizedPercentage : undefined}
    >
      {/* 修复说明：进度填充和文字分层，避免 0% 时溢出的文字或选中背景看起来像已有进度。 */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 bg-blue-400"
        style={{ width: `${normalizedPercentage}%` }}
      />
      <div className="relative z-10 px-1 text-sm leading-5 whitespace-nowrap overflow-hidden text-ellipsis select-none">
        {text} ({hasKnownTotal
          ? `${normalizedPercentage.toFixed(2)}% of ${formatBytes(total)}`
          : "preparing download..."})
      </div>
    </div>
  );
}
