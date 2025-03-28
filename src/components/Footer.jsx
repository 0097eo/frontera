import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-10 text-gray-700 w-full mt-auto">
      <div className="container mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Company Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ideal Furniture & Decor</h1>
          <p className="mt-2 text-sm">Nyamasaria, Kisumu, Kenya</p>
        </div>

        {/* Navigation Links */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Links</h2>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
            <li><Link to="/shop" className="hover:text-gray-900">Shop</Link></li>
            <li><Link to="/about" className="hover:text-gray-900">About</Link></li>
            <li><Link to="/contact" className="hover:text-gray-900">Contact</Link></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Newsletter</h2>
          <div className="flex items-center border-b border-gray-400 py-2">
            <input
              type="email"
              placeholder="Enter Your Email Address"
              className="w-full px-2 py-1 outline-none bg-transparent"
            />
            <button className="ml-2 font-semibold text-gray-900 hover:underline">SUBSCRIBE</button>
          </div>
        </div>
      </div>

      {/* Copyright with Dynamic Year */}
      <div className="text-center text-gray-600 text-sm mt-8 border-t pt-4">
        <p>© {new Date().getFullYear()} Ideal Furniture & Decor. All rights reserved.</p>
      </div>
    </footer>
  );
}
