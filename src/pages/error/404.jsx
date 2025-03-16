import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

const ProductNotFound = () => {
  return (
    <div className="bg-amber-50 min-h-screen flex items-center justify-center">
      <div className="text-center px-6 max-w-xl">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-amber-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19.09H5V4.91h14v14.18z"/>
            <path d="M9 15.41l4.59-4.58L15 12.22 9 18.22l-3.59-3.59L6.82 13.2z" className="opacity-0"/>
          </svg>
          <h1 className="text-4xl font-bold text-amber-800 mt-4">Product Not Found</h1>
          <div className="h-1 w-16 bg-amber-400 mx-auto rounded-full my-4"></div>
          <p className="text-lg text-amber-700 mb-6">
            We couldn't find the product you're looking for. It might be sold out, discontinued, or the spelling might be incorrect.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="/shop"
            className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Browse Products
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-white text-amber-600 font-medium rounded-lg border border-amber-300 hover:bg-amber-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </a>
        </div>
        
        <div className="mt-8 text-amber-600">
          <p className="text-sm">
            Need help finding something? <a href="/contact" className="underline hover:text-amber-800">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;