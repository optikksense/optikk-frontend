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
    <div className="border-[color:var(--glass-border)] border-t p-4 text-center">
      <button
        type="button"
        className="min-w-[200px] cursor-pointer rounded-[7px] border border-primary bg-transparent px-6 py-2 font-medium text-[13px] text-primary transition-all duration-150 hover:bg-[var(--color-primary-subtle-10)] disabled:cursor-not-allowed disabled:opacity-50"
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
