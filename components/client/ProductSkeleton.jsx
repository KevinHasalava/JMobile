"use client";
import React from 'react';

// Skeleton loading component for products
const ProductSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-64 bg-dark-bg"></div>

          {/* Content skeleton */}
          <div className="p-5">
            {/* Brand skeleton */}
            <div className="h-4 bg-dark-bg rounded w-24 mb-3"></div>

            {/* Title skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-5 bg-dark-bg rounded w-full"></div>
              <div className="h-5 bg-dark-bg rounded w-3/4"></div>
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center mb-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-dark-bg rounded"></div>
                ))}
              </div>
              <div className="h-4 bg-dark-bg rounded w-12 ml-2"></div>
            </div>

            {/* Price skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 bg-dark-bg rounded w-24"></div>
              <div className="h-4 bg-dark-bg rounded w-20"></div>
            </div>

            {/* Stock skeleton */}
            <div className="mb-4 h-4 bg-dark-bg rounded w-16"></div>

            {/* Buttons skeleton */}
            <div className="flex space-x-2">
              <div className="flex-1 h-10 bg-dark-bg rounded-lg"></div>
              <div className="flex-1 h-10 bg-dark-bg rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
