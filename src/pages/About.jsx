import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Lightbulb, Users } from 'lucide-react';
import man1 from '../assets/man1.jpg'
import man2 from '../assets/man2.jpg'
import woman3 from '../assets/woman3.jpg'
import woman1 from '../assets/woman1.jpg'
import showroom from '../assets/showroom.jpg'
import storeImage from '../assets/dresser.jpg'
import { useEffect } from 'react';

const AboutPage = () => {
  // Team members data with images and information
  const teamMembers = [
    { id: 1, name: "John Davis", position: "Founder & CEO", image: man1 },
    { id: 2, name: "Michael Roberts", position: "Design Director", image: man2 },
    { id: 3, name: "Sarah Johnson", position: "Customer Experience", image: woman1 },
    { id: 4, name: "Emily Chen", position: "Interior Specialist", image: woman3 }
  ];

  useEffect(() => {
    document.title = 'About | Shop';
  }, []);

  return (
    <div className="bg-gray-50 pt-16">
      {/* Header Image - Updated to match CartPage style */}
      <div className="relative text-center">
        <div className="w-full h-24 sm:h-32 md:h-40 lg:h-56 overflow-hidden">
          <img 
            src={storeImage} 
            alt="Eshop furniture store" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">About Us</h1>
          <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-200">About Us</span>
          </p>
        </div>
      </div>


      {/* Our Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Eshop began with a simple vision: to provide high-quality, stylish furniture that transforms houses into homes. Founded in 2010 by furniture enthusiasts with a passion for craftsmanship, we've grown from a small showroom to becoming one of the region's most trusted furniture retailers.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a curated collection of sofas and dining sets has evolved into a comprehensive range of furniture and home accessories for every room. Through the years, our commitment to quality, design, and customer satisfaction has remained unwavering.
            </p>
            <p className="text-gray-700">
              Today, Eshop continues to bring together the best furniture designs from around the world, making them accessible to homeowners who appreciate the difference that thoughtfully chosen pieces can make.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden h-80">
            <img 
              src={storeImage} 
              alt="Eshop store" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Quality</h3>
              <p className="text-gray-700 text-center">
                We source only the finest materials and partner with skilled craftspeople who share our dedication to excellence.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Innovation</h3>
              <p className="text-gray-700 text-center">
                We continuously explore new designs, materials, and manufacturing techniques to bring you forward-thinking furniture.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Customer Focus</h3>
              <p className="text-gray-700 text-center">
                From personalized shopping experiences to after-sales support, your satisfaction drives everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center">
              <div className="w-40 h-40 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-gray-600">{member.position}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showroom */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6">Visit Our Showroom</h2>
              <p className="text-gray-700 mb-6">
                Experience our furniture firsthand in our spacious, thoughtfully designed showroom. Our consultants are on hand to help you find the perfect pieces for your space.
              </p>
              <div className="mb-4">
                <h3 className="font-bold text-lg">Location</h3>
                <p className="text-gray-700">123 Eshop street, Nairobi, Kenya</p>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-lg">Hours</h3>
                <p className="text-gray-700">Monday-Saturday: 10am-8pm</p>
                <p className="text-gray-700">Sunday: 11am-6pm</p>
              </div>
              <Link to="/contact">
                <button className="bg-amber-600 text-white px-6 py-3  hover:bg-amber-600 transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
            <div className="order-1 md:order-2 rounded-lg overflow-hidden h-80">
              <img 
                src={showroom} 
                alt="Eshop showroom" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Ready to Transform Your Space?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-800">
            Browse our collection and discover furniture that combines style, comfort, and quality craftsmanship.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop">
              <button className="bg-amber-600 text-white px-6 py-3 font-bold hover:bg-amber-700 transition-colors">
                Shop Now
              </button>
            </Link>
            <Link to="/contact">
              <button className="border-2 border-amber-600 text-amber-600 px-6 py-3  font-bold hover:bg-amber-100 transition-colors">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;