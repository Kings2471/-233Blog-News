import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-8 border-l-4 border-slate-600 pl-4">
            About +233BLOG-NEWS
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                +233BLOG-NEWS is Ghana's premier digital news platform, committed to delivering accurate, 
                timely, and comprehensive coverage of local and international news that matters to Ghanaians. 
                We strive to inform, educate, and empower our readers with quality journalism that upholds 
                the highest standards of integrity and professionalism.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed">
                Founded in 2017, +233BLOG-NEWS emerged from a vision to create a modern, accessible news 
                platform that bridges the gap between traditional journalism and digital innovation. Our team 
                of experienced journalists, editors, and digital specialists work around the clock to bring 
                you the most important stories from across Ghana and beyond.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-600 mb-2">Accuracy</h3>
                  <p className="text-gray-600 text-sm">We verify our sources and fact-check our stories to ensure reliability.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-600 mb-2">Independence</h3>
                  <p className="text-gray-600 text-sm">We maintain editorial independence and report without bias or external influence.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-600 mb-2">Community</h3>
                  <p className="text-gray-600 text-sm">We serve the Ghanaian community with stories that matter to their daily lives.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-600 mb-2">Innovation</h3>
                  <p className="text-gray-600 text-sm">We embrace technology to deliver news in engaging and accessible formats.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">Contact Information</h2>
              <div className="bg-slate-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Digital Media House, Accra, Ghana</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> +233 59 168 3489</p>
                <p className="text-gray-700 mb-2"><strong>Email:</strong> info@233blognews.com</p>
                <p className="text-gray-700"><strong>Editorial:</strong> editorial@233blognews.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
