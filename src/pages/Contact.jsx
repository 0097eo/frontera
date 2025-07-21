import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Trophy, BadgeCheck, Truck, Headset } from 'lucide-react';
import contactImage from '../assets/dresser.jpg';
// Import the ContactMap component
import ContactMap from '../components/ContactMap';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
      document.title = 'Contact | Ideal Furniture & Decor';
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create Gmail compose URL with form data
    const to = 'info@idealfurniture.com';
    const subject = encodeURIComponent(formData.subject || 'Contact Form Inquiry');
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
    
    // Open Gmail compose in a new tab
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailComposeUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 pt-16">
      {/* Header Image */}
      <div className="relative text-center">
        <div className="w-full h-24 sm:h-32 md:h-40 lg:h-56 overflow-hidden">
          <img 
            src={contactImage} 
            alt="Contact Us" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/api/placeholder/1200/400";
              e.target.onerror = null;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Contact</h1>
          <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-200">Contact</span>
          </p>
        </div>
      </div>

      {/* Get In Touch Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold">Get In Touch With Us</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mt-4">
          For More Information About Our Product & Services, Please Feel Free To Drop Us
          An Email. Our Staff Always Be There To Help You Out. Do Not Hesitate!
        </p>
      </div>

      {/* Contact Information and Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information Column */}
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="mt-1">
                <MapPin className="h-6 w-6 text-gray-800" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Address</h3>
                <p className="text-gray-700 mt-1">Nyamasaria, Kisumu, Kenya</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mt-1">
                <Phone className="h-6 w-6 text-gray-800" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Phone</h3>
                <p className="text-gray-700 mt-1">Mobile: +(254) 123-4567</p>
                <p className="text-gray-700">Hotline: +(254) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mt-1">
                <Clock className="h-6 w-6 text-gray-800" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Working Time</h3>
                <p className="text-gray-700 mt-1">Monday-Friday: 9:00 - 22:00</p>
                <p className="text-gray-700">Saturday-Sunday: 9:00 - 21:00</p>
              </div>
            </div>
            
            {/* Map placed below working time */}
            <ContactMap />
          </div>

          {/* Contact Form Column */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ABC"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ABC@def.com"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="This is an optional"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Hi! I'd like to ask about"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none h-32"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition duration-200"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Features Section */}
      <div className="w-full bg-amber-50 mt-12 py-8 border-t border-amber-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">High Quality</h3>
              <p className="text-xs text-gray-600">Crafted from top materials</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Warranty Protection</h3>
              <p className="text-xs text-gray-600">Over 2 years</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600">Orders over KSh 50k</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">24 / 7 Support</h3>
              <p className="text-xs text-gray-600">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;