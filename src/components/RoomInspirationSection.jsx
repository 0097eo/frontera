import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import room1 from '../assets/room1.jpg';
import room2 from '../assets/room2.jpg';
import room3 from '../assets/room3.jpg';
import room4 from '../assets/room4.jpg';
import room5 from '../assets/room5.jpg';
import room6 from '../assets/room6.jpg';


const roomInspirations = [
  { id: '01', image: room1, type: 'Living Room', title: 'Inner Peace' },
  { id: '02', image: room2, type: 'Living Room', title: 'Comfort' },
  { id: '03', image: room3, type: 'Lounge', title: 'Cozy' },
  { id: '04', image: room4, type: 'Living Room', title: 'Relaxation' },
  { id: '05', image: room5, type: 'Bed Room', title: 'Sweet Dreams' },
  { id: '06', image: room6, type: 'Bed Room', title: 'Relaxation' }
];

const RoomInspirationSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate()

  const handleExplore = () => {
    navigate('/shop');
  }
  
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === roomInspirations.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? roomInspirations.length - 1 : prev - 1
    );
  };
  
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="my-16 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left content */}
        <div className="flex flex-col justify-center p-6">
          <h2 className="text-4xl font-bold mb-4">Beautiful rooms inspiration</h2>
          <p className="text-gray-600 mb-8">
            Our designer already made a lot of beautiful prototype of rooms that inspire you
          </p>
          <button onClick={handleExplore} className="bg-amber-600 text-white px-6 py-3 w-40 hover:bg-amber-700 transition-colors">
            Explore More
          </button>
        </div>
        
        {/* Right content - Slider */}
        <div className="relative overflow-hidden">
          {/* Main large image */}
          <div className="relative">
            <img 
              src={roomInspirations[currentSlide].image} 
              alt={roomInspirations[currentSlide].title}
              className="w-full h-96 object-cover"
            />
            
            {/* Image overlay info */}
            <div className="absolute bottom-0 left-0 bg-white p-6 w-64">
              <div className="flex items-center mb-2">
                <span className="text-gray-500 mr-3">{roomInspirations[currentSlide].id}</span>
                <span className="border-t border-gray-300 flex-grow mr-3"></span>
                <span className="text-gray-600">{roomInspirations[currentSlide].type}</span>
              </div>
              <h3 className="text-2xl font-semibold">{roomInspirations[currentSlide].title}</h3>
              
              {/* Next button */}
              <button 
                onClick={nextSlide}
                className="absolute bottom-6 right-6 bg-amber-600 p-2 text-white hover:bg-amber-700"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Dot indicators */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {roomInspirations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? 'bg-amber-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomInspirationSection;