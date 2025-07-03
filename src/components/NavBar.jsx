import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  ShoppingCart, 
  Heart, 
  LogOut, 
} from 'lucide-react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useWishList from '../hooks/useWishList';
import logo from '../assets/logo.png';


const CartIconWithBadge = () => {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative">
      <ShoppingCart strokeWidth={2.5} size={22} />
      {totalItems > 0 && (
        <div 
          className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
          data-testid="cart-badge"
        >
          {totalItems > 9 ? '9+' : totalItems}
        </div>
      )}
    </div>
  );
};

const WishlistIconWithBadge = () => {
  const { wishlist } = useWishList();
  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <div className="relative">
      <Heart strokeWidth={2.5} size={22} />
      {wishlistCount > 0 && (
        <div 
          className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
          data-testid="wishlist-badge"
        >
          {wishlistCount > 9 ? '9+' : wishlistCount}
        </div>
      )}
    </div>
  );
};

const NavItem = ({ to, children, setIsOpen, icon: IconComponent }) => (
  <NavLink
    to={to}
    onClick={() => setIsOpen(false)}
    className={({ isActive }) =>
      `flex items-center space-x-2 py-2 px-1 relative group ${
        isActive 
          ? 'text-amber-600 font-bold' 
          : 'text-gray-700 hover:text-amber-600'
      } transition-colors duration-300`
    }
  >
    {({ isActive }) => (
      <>
        {IconComponent && <IconComponent />}
        <span>{children}</span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-amber-600 transition-all duration-300 ease-out group-hover:w-full ${
            isActive ? 'w-full' : 'w-0'
          }`}
        ></span>
      </>
    )}
  </NavLink>
);

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  icon: PropTypes.elementType
};

const NavIcon = ({ to, title, children }) => (
  <NavLink
    to={to}
    title={title}
    className={({ isActive }) => 
      `p-1 transition-colors duration-300 ${
        isActive ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
      }`
    }
  >
    {children}
  </NavLink>
);

NavIcon.propTypes = {
  to: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired
};

const Logo = () => (
  <div className="flex items-center space-x-2">
    <img 
      src={logo} 
      alt="Ideal Furniture Logo" 
      className="h-8 w-auto object-contain sm:h-10"
    />
    <span className="text-lg sm:text-2xl font-bold">
      <span className="text-amber-600">Ideal Furniture</span> & Decor
    </span>
  </div>
);

// --- Main Navbar Component ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > 100 && window.scrollY > lastScrollY) {
        setIsOpen(false);
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home'},
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 transition-transform duration-300 ease-in-out ${isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center p-4">
          <div className="w-1/3 md:w-1/4">
            <NavLink to="/" className="hover:opacity-80 transition-opacity duration-200">
              <Logo />
            </NavLink>
          </div>

          <div data-testid="desktop-nav-links" className="hidden md:flex items-center justify-center space-x-8 w-2/4 font-bold">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} setIsOpen={setIsOpen}>{link.label}</NavItem>
            ))}
          </div>
          
          <div data-testid="desktop-auth-section" className="hidden md:flex items-center justify-end space-x-4 font-bold w-1/3 md:w-1/4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-5">
                <NavIcon to="/account" title="My Account">
                  <User strokeWidth={2.5} size={22} />
                </NavIcon>
                <NavIcon to="/cart" title="Shopping Cart">
                  <CartIconWithBadge />
                </NavIcon>
                <NavIcon to="/wishList" title="My Wishlist">
                  <WishlistIconWithBadge />
                </NavIcon>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-500 transition-colors duration-300" title="Logout">
                  <LogOut strokeWidth={2.5} size={22} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3"> 
                <NavIcon to="/cart" title="Shopping Cart">
                  <CartIconWithBadge />
                </NavIcon>
                <NavLink to="/login"><button className="border-2 border-gray-300 px-4 py-1.5  text-gray-800 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">Login</button></NavLink>
                <NavLink to="/signup"><button className="bg-amber-600 text-white px-4 py-2  font-semibold hover:bg-amber-700 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">Sign Up</button></NavLink>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <NavIcon to="/cart" title="Shopping Cart">
                <CartIconWithBadge />
            </NavIcon>
            <button data-testid="mobile-menu-button" onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-amber-600 p-1">
              {isOpen ? <X strokeWidth={2.5} size={28} /> : <Menu strokeWidth={2.5} size={28} />}
            </button>
          </div>
        </div>

        <div data-testid="mobile-menu" className={`transition-all duration-500 ease-in-out md:hidden overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="p-4 space-y-2 bg-white/95 border-t border-gray-200 font-bold">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} setIsOpen={setIsOpen}>{link.label}</NavItem>
            ))}
            
            <hr className="my-2 border-gray-200" />

            {isAuthenticated ? (
              <>
                <NavItem to="/account" setIsOpen={setIsOpen} icon={User}>Account</NavItem>
                <NavItem to="/cart" setIsOpen={setIsOpen} icon={CartIconWithBadge}>Cart</NavItem>
                <NavItem to="/wishList" setIsOpen={setIsOpen} icon={WishlistIconWithBadge}>Wish List</NavItem>
                <button data-testid="mobile-logout-button" onClick={handleLogout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-500 transition-colors duration-300">
                  <LogOut strokeWidth={2.5} size={20} />
                  <span className="font-bold">Logout</span>
                </button>
              </>
            ) : (
              <div className="px-2 space-y-3 pt-2">
                <NavItem to="/cart" setIsOpen={setIsOpen} icon={CartIconWithBadge}>Cart</NavItem>
                <NavLink to="/login" className="block" onClick={() => setIsOpen(false)}>
                  <button className="w-full border-2 border-gray-300 py-2 hover:bg-gray-100 font-semibold">Login</button>
                </NavLink>
                <NavLink to="/signup" className="block" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-amber-600 text-white py-2.5  hover:bg-amber-700 font-semibold">Sign Up</button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;