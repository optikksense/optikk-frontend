import { Spin } from 'antd';

interface BoardLoadMoreFooterProps {
  entityName: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage?: () => void;
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
    <div className="oboard__load-more">
      <button
        className="oboard__load-more-btn"
        onClick={() => onFetchNextPage?.()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? (
          <>
            <Spin size="small" style={{ marginRight: 8 }} />
            Loading…
          </>
        ) : (
          `Load older ${entityName}s`
        )}
      </button>
    </div>
  );
}
