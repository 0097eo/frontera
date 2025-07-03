import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../src/components/NavBar';
import useAuth from '../src/hooks/useAuth';
import useCart from '../src/hooks/useCart';
import useWishList from '../src/hooks/useWishList';

vi.mock('../src/hooks/useAuth');
vi.mock('../src/hooks/useCart');
vi.mock('../src/hooks/useWishList');

vi.mock('../assets/logo.png', () => ({
    default: 'mock-logo.png'
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Navbar', () => {

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            isAuthenticated: false,
            logout: vi.fn(),
        });
        useCart.mockReturnValue({
            items: [],
        });
        useWishList.mockReturnValue({
            wishlist: { products: [] },
        });
    });

    it('renders logo and brand name', () => {
        renderWithRouter(<Navbar />);
        expect(screen.getByAltText('Ideal Furniture Logo')).toBeInTheDocument();
        expect(screen.getByText(/Ideal Furniture/)).toBeInTheDocument();
    });

    it('renders navigation links in both desktop and mobile views', () => {
        renderWithRouter(<Navbar />);
        const desktopNav = screen.getByTestId('desktop-nav-links');
        const mobileMenu = screen.getByTestId('mobile-menu');

        expect(within(desktopNav).getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(within(desktopNav).getByRole('link', { name: 'Shop' })).toBeInTheDocument();
        expect(within(desktopNav).getByRole('link', { name: 'About' })).toBeInTheDocument();
        expect(within(desktopNav).getByRole('link', { name: 'Contact' })).toBeInTheDocument();

        expect(within(mobileMenu).getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('link', { name: 'Shop' })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('link', { name: 'About' })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('shows login/signup buttons when not authenticated', () => {
        renderWithRouter(<Navbar />);
        
        const desktopAuth = screen.getByTestId('desktop-auth-section');
        expect(within(desktopAuth).getByRole('button', { name: 'Login' })).toBeInTheDocument();
        expect(within(desktopAuth).getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
        
        fireEvent.click(screen.getByTestId('mobile-menu-button'));
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(within(mobileMenu).getByRole('button', { name: 'Login' })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('shows user menu when authenticated', () => {
        useAuth.mockReturnValue({ 
            isAuthenticated: true,
            logout: vi.fn()
        });
        renderWithRouter(<Navbar />);
        
        const desktopAuth = screen.getByTestId('desktop-auth-section');
        expect(within(desktopAuth).getByTitle('My Account')).toBeInTheDocument();
        expect(within(desktopAuth).getByTitle('Shopping Cart')).toBeInTheDocument();
        expect(within(desktopAuth).getByTitle('My Wishlist')).toBeInTheDocument();
        expect(within(desktopAuth).getByTitle('Logout')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('mobile-menu-button'));
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(within(mobileMenu).getByRole('link', { name: /Account/ })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('link', { name: /Cart/ })).toBeInTheDocument();
        expect(within(mobileMenu).getByRole('link', { name: /Wish List/ })).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger button is clicked', async () => {
        renderWithRouter(<Navbar />);
        
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(mobileMenu).toBeVisible();

        const menuButton = screen.getByTestId('mobile-menu-button');
        fireEvent.click(menuButton);
        expect(mobileMenu).toBeVisible();

        fireEvent.click(menuButton);
        await waitFor(() => {
          expect(mobileMenu).toBeVisible();
        });
    });

    it('handles logout from mobile menu', async () => {
        const mockLogout = vi.fn().mockResolvedValue(undefined);
        useAuth.mockReturnValue({
          isAuthenticated: true,
          logout: mockLogout
        });
        
        renderWithRouter(<Navbar />);
        
        fireEvent.click(screen.getByTestId('mobile-menu-button'));
        
        const mobileMenu = screen.getByTestId('mobile-menu');
        const logoutButton = within(mobileMenu).getByTestId('mobile-logout-button');
        fireEvent.click(logoutButton);
        
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
        });
    });
});