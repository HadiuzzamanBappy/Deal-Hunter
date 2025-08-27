import React from 'react';

const Results = ({ results, allProducts, totalCount, onLoadMore, isLoading, allLoaded }) => {
  if (!results) return null;
  // Find second best by AI logic: next highest price, or next in sorted list (demo logic)
  // ...existing code...
  // Only show summary string, not full JSON
  // Parse summary if it looks like a JSON string
  let summaryText = results.aiSummary || results.summary;
  if (typeof summaryText === 'string' && summaryText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(summaryText);
      summaryText = parsed.summary || summaryText;
    } catch (e) {
      // Not JSON, use as is
    }
  }
  return (
      <div className="relative bg-white/70 dark:bg-gray-900/60 rounded-3xl shadow-2xl p-8 mt-8 backdrop-blur-lg border border-white/20">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-2 drop-shadow-lg">AI Deal Summary</h2>
          <p className="text-gray-700 dark:text-gray-200 text-lg italic">{summaryText}</p>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {allProducts.map((product) => (
            <a
              href={product.viewItemURL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden bg-gradient-to-br from-white/80 via-indigo-100/60 to-purple-100/40 dark:from-gray-900/80 dark:via-indigo-900/60 dark:to-purple-900/40 backdrop-blur-lg border border-white/30 hover:scale-[1.03] hover:z-10"
              key={product.itemId}
            >
              <img
                src={product.galleryURL || 'https://placehold.co/400'}
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-2xl border-b border-white/20"
              />
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <span className="bg-indigo-600/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-indigo-300/40">{product.source || 'eBay'}</span>
                {product.label === 'Best Choice' && (
                  <span className="bg-yellow-400/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-yellow-200/40 flex items-center gap-1">
                    <span role="img" aria-label="star">⭐</span> Best Choice
                  </span>
                )}
                {product.label === 'Second Best' && (
                  <span className="bg-blue-400/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-blue-200/40 flex items-center gap-1">
                    <span role="img" aria-label="medal">🥈</span> Second Best
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-base text-gray-900 dark:text-white mb-2 truncate drop-shadow-sm">{product.title}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg drop-shadow">{product.price}</p>
              </div>
            </a>
          ))}
        </div>
      {!allLoaded && (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg transition-colors duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
      )}
      {allLoaded && (
        <div className="flex justify-center mt-8">
          <span className="text-gray-500 dark:text-gray-300 font-semibold">All products loaded</span>
        </div>
      )}
    </div>
  );
};

export default Results;
