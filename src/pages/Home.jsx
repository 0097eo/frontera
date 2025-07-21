import { Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import discoverImage from '../assets/hero.jpg';
import Instagram4 from '../assets/instagram4.jpg';
import kingBed from '../assets/kingBed.jpg';
import sofa from '../assets/sofa.jpg';
import RoomInspirationSection from '../components/RoomInspirationSection';
import InstagramGallerySection from '../components/InstagramGallerySection';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useEffect } from 'react';

const categories = [
  { name: 'Dining', image: Instagram4 },
  { name: 'Living', image: sofa },
  { name: 'Bedroom', image: kingBed },
];

const Home = () => {
  const navigate = useNavigate();
  const handleshopNow = () => navigate('/shop');

  useEffect(() => {
    document.title = 'Home | Ideal Furniture & Decor';
  }, []);
  
  // Use the products hook with a limit parameter
  const { data: productData, isLoading, error } = useProducts(1, { limit: 8 });

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex">
        <img 
          src={discoverImage} 
          alt="New Collection" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-1/2 right-10 md:right-32 lg:right-48 transform -translate-y-1/2 bg-white p-12 shadow-xl max-w-md flex flex-col justify-between">
          <div>
            <p>New Arrivals</p>
            <h2 className="text-4xl font-bold mb-6 text-amber-600">Discover Our New Collection</h2>
            <p className="mb-8 text-gray-600 text-lg leading-relaxed">
              Discover our latest furniture designs that blend comfort, style, and innovation
            </p>
          </div>
          <button onClick={handleshopNow} className="bg-amber-600 text-white w-3/5 px-10 py-4 text-lg hover:bg-amber-600 transition-colors mt-auto">
            Shop Now
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Browse Range */}
        <section className="text-center my-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Browse The Range</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {categories.map((category) => (
              <div key={category.name} className="text-center">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-40 sm:h-60 md:h-72 lg:h-96 object-cover rounded-lg" 
                />
                <p className="text-lg font-medium mt-2">{category.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Section - Limited to 8 products */}
        <section className="text-center my-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Our Products</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-red-500">Error loading products. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {productData?.results?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8">
            <button 
              onClick={handleshopNow} 
              className="bg-amber-600 text-white px-8 py-3 text-lg hover:bg-amber-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        </section>

        {/* Room Inspirations */}
        <RoomInspirationSection />

        {/* Instagram */}
        <InstagramGallerySection />
      </div>
    </div>
  );
};

export default Home;