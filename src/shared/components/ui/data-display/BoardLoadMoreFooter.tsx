interface BoardLoadMoreFooterProps {
  entityName: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: (() => void) | undefined;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.hasNextPage
 * @param root0.isFetchingNextPage
 * @param root0.onFetchNextPage
 */
export default function BoardLoadMoreFooter({
  entityName,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: BoardLoadMoreFooterProps) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="p-4 text-center border-t border-[color:var(--glass-border)]">
      <button
        className="min-w-[200px] px-6 py-2 bg-transparent border border-primary text-primary rounded-[7px] cursor-pointer text-[13px] font-medium transition-all duration-150 hover:bg-[var(--color-primary-subtle-10)] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onFetchNextPage?.()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? (
          <>
            <div className="ok-spinner" style={{ marginRight: 8 }} />
            Loading…
          </>
        ) : (
          `Load older ${entityName}s`
        )}
      </button>
    </div>
  );
}
