
import React from 'react';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { usePagination } from '../hooks/usePagination';
import { useArticles } from '../hooks/useArticles';

const Opinion = () => {
  const { articles: opinionPieces, loading, error } = useArticles('Opinion');
  
  const { currentItems, hasMore, loadMore } = usePagination({
    items: opinionPieces,
    itemsPerPage: 2
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg mb-2">Loading opinion articles...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg mb-2 text-red-600">Error loading articles</div>
            <div className="text-sm text-gray-600">{error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="animate-fade-in-up">
              <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-6 border-l-4 border-ghana-green pl-4">
                Opinion & Analysis
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Read thoughtful analysis and diverse perspectives on current affairs and societal issues.
              </p>
            </section>

            <section>
              {currentItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentItems.map((news, index) => (
                    <div key={news.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <NewsCard
                        article={news}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No opinion articles available at the moment.</p>
                </div>
              )}
            </section>

            {hasMore && (
              <div className="text-center pt-8">
                <button 
                  onClick={loadMore}
                  className="bg-ghana-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Load More Opinion Pieces
                </button>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Opinion;
