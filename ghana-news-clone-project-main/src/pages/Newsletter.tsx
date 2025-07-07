import React from 'react';
import NewsletterSubscription from '../components/NewsletterSubscription';

const NewsletterPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Newsletter Subscription</h1>
      <NewsletterSubscription />
    </div>
  );
};

export default NewsletterPage; 