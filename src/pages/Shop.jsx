import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import headerImage from '../assets/dresser.jpg';
import { SlidersHorizontal, LayoutGrid, List, BadgeCheck, Truck, Headset, Trophy, ChevronLeft, ChevronRight} from 'lucide-react';
import ProductNotFound from './error/404';
import Error500 from './error/500';
import { Link } from 'react-router-dom';


const ProductList = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    primary_material: '',
    condition: '',
    min_price: '',
    max_price: '',
    is_available: '',
    ordering: '-created_at'
  });
  const [filterForm, setFilterForm] = useState({...filters});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState('12');
  const { data, isPending, isError, error, refetch } = useProducts(page, filters);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState(false);

  // Check if the error is a server error (status 500)
  useEffect(() => {
    document.title = 'Products | Ideal Furniture & Decor'
    if (isError && error?.response?.status === 500) {
      setServerError(true);
    } else {
      setServerError(false);
    }
  }, [isError, error]);

  // Handle retry for server error
  const handleRetry = () => {
    setServerError(false);
    refetch();
  };

  // Prefetch next page when current page loads
  useEffect(() => {
    if (data?.next) {
      queryClient.prefetchQuery({
        queryKey: ['products', page + 1, filters],
        queryFn: async () => {
          const queryParams = new URLSearchParams();
          queryParams.append('page', page + 1);
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
          });
          
          try {
            const { data } = await axios.get(`/api/products/products/?${queryParams}`);
            return data;
          } catch (error) {
            if (error?.response?.status === 500) {
              setServerError(true);
            }
            throw error;
          }
        }
      });
    }
  }, [data, page, filters, queryClient]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setFilters(filterForm);
    setPage(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const resetForm = {
      search: '',
      category: '',
      primary_material: '',
      condition: '',
      min_price: '',
      max_price: '',
      is_available: '',
      ordering: '-created_at'
    };
    setFilterForm(resetForm);
    setFilters(resetForm);
    setPage(1);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSortChange = (e) => {
    const newOrdering = e.target.value;
    setFilterForm(prev => ({ ...prev, ordering: newOrdering }));
    setFilters(prev => ({ ...prev, ordering: newOrdering }));
    setPage(1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(e.target.value);
  };

  return (
    <div className="bg-gray-50 pt-16">
      {/* Shop Header */}
      <div className="relative text-center">
        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-64 overflow-hidden">
            <img 
            src={headerImage} 
            alt="Furniture Shop Header" 
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white">Shop</h1>
            <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-white">Shop</span>
            </p>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-amber-50 shadow-sm p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={toggleFilters}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-700 text-sm"
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>
            
            <div className="flex items-center border border-gray-200 rounded">
              <button 
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                onClick={() => handleViewModeChange('grid')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                data-testid="list-view-button"
                className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                onClick={() => handleViewModeChange('list')}
              >
                <List size={16} />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Showing <span className="font-medium">{data?.count || 0}</span> of {data?.count || 0} results
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-gray-500">Show:</span>
              <select 
                className="border-gray-200 rounded-md focus:ring-0 py-1 px-1 sm:px-2"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={filters.ordering}
                onChange={handleSortChange}
                className="border-gray-200 rounded-md focus:ring-0 py-1 px-1 sm:px-2"
              >
                <option value="-created_at">Newest</option>
                <option value="created_at">Oldest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="-name">Name: Z to A</option>
                <option value="default">Default</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2 sm:hidden">
          Showing <span className="font-medium">{data?.count || 0}</span> of {data?.count || 0} results
        </div>
      </div>
        
    
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {showFilters && (
          <div className="bg-white shadow-md rounded-lg p-3 sm:p-6 mb-4 sm:mb-8 transition-all">
            <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Filter Products</h3>
            <form onSubmit={applyFilters}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    name="search"
                    value={filterForm.search}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                    placeholder="Search products..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={filterForm.category}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="1">Chairs</option>
                    <option value="2">Sofas</option>
                    <option value="3">Coffee Tables</option>
                    <option value="4">Beds</option>
                    <option value="5">Wardrobes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select
                    name="primary_material"
                    value={filterForm.primary_material}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                  >
                    <option value="">All Materials</option>
                    <option value="WOOD">Wood</option>
                    <option value="METAL">Metal</option>
                    <option value="FABRIC">Fabric</option>
                    <option value="LEATHER">Leather</option>
                    <option value="GLASS">Glass</option>
                    <option value="PLASTIC">Plastic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={filterForm.condition}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                  >
                    <option value="">All Conditions</option>
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Price (Ksh)</label>
                  <input
                    type="number"
                    name="min_price"
                    value={filterForm.min_price}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                    placeholder="Minimum price"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Price (Ksh)</label>
                  <input
                    type="number"
                    name="max_price"
                    value={filterForm.max_price}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                    placeholder="Maximum price"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    name="is_available"
                    value={filterForm.is_available}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm"
                  >
                    <option value="">All Products</option>
                    <option value="true">Available Only</option>
                    <option value="false">Sold Out</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  type="submit"
                  className="bg-amber-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-amber-700 transition-colors text-sm"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gray-200 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Products Grid/List View with Error 500 Handling */}
        <div className="mb-6 sm:mb-8">
          {isPending ? (
            <div role='status' className="flex justify-center items-center h-40 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : serverError ? (
            <Error500 onRetry={handleRetry} />
          ) : isError ? (
            <div className="text-red-500 my-4 sm:my-8 text-center text-sm sm:text-base">
              Error loading products: {error.message}
            </div>
          ) : data?.results.length === 0 ? (
            <ProductNotFound />
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {data?.results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-4">
                {data?.results.map((product) => (
                  <div key={product.id} className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="w-full sm:w-1/4 md:w-1/5 h-48 sm:h-auto">
                      <img 
                        src={product.image_url || headerImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex-1">
                      <h3 className="font-medium text-base sm:text-lg mb-1">{product.name}</h3>
                      <p className="text-amber-600 font-bold mb-2">Ksh {formatPrice(product.price?.toLocaleString())}</p>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex gap-2">
                        <button className="bg-amber-600 text-white text-xs sm:text-sm px-3 py-1 rounded hover:bg-amber-700">
                          Add to Cart
                        </button>
                        <Link to={`/products/${product.id}`}>
                        <button className="border border-gray-300 text-gray-700 text-xs sm:text-sm px-3 py-1 rounded hover:bg-gray-100">
                          View Details
                        </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        
        {/* Pagination Controls */}
        {data && data.count > 0 && (
          <div className="flex justify-center items-center mb-4 sm:mb-6">
            <div className="flex items-center bg-gray-100">
              <button 
                onClick={() => setPage(page => Math.max(page - 1, 1))}
                disabled={page === 1}
                className={`px-2 sm:px-3 py-1 text-sm ${
                  page === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-amber-600'
                }`}
              >
                <ChevronLeft size={28} />
              </button>
              
              {/* Only show pagination numbers if there's enough space */}
              <div className="hidden xs:flex">
                <button
                  onClick={() => setPage(1)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-none text-sm ${
                    page === 1
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1
                </button>
                
                <button
                  onClick={() => setPage(2)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-none text-sm ${
                    page === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2
                </button>
                
                <button
                  onClick={() => setPage(3)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-none text-sm ${
                    page === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  3
                </button>
              </div>
              
              {/* For mobile screens, show current page / total pages */}
              <div className="xs:hidden px-2">
                <span className="text-sm text-gray-700">{page}</span>
              </div>
              
              <button
                onClick={() => setPage(page => page + 1)}
                disabled={!data.next}
                className={`px-2 sm:px-3 py-1 text-sm bg-gray-100 text-gray-700 ${
                  !data.next
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-amber-600'
                }`}
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Features */}
      <div className="w-full bg-amber-50 py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">High Quality</h3>
              <p className="text-xs text-gray-600 xs:block">Curated products</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Warranty Protection</h3>
              <p className="text-xs text-gray-600">Over 2 years</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600 xs:block">Orders over KSh 50k</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600  xs:block">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;