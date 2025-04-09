import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../src/components/NavBar';
import useAuth from '../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../src/hooks/useAuth');

// Mock the logo import
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
    it('renders logo and brand name', () => {
        useAuth.mockReturnValue({ isAuthenticated: false });
        renderWithRouter(<Navbar />);
        expect(screen.getByAltText('Ideal Furniture Logo')).toBeInTheDocument();
        expect(screen.getByText('Ideal Furniture')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        useAuth.mockReturnValue({ isAuthenticated: false });
        renderWithRouter(<Navbar />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Shop')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('shows login/signup buttons when not authenticated', () => {
        useAuth.mockReturnValue({ isAuthenticated: false });
        renderWithRouter(<Navbar />);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows user menu when authenticated', () => {
        useAuth.mockReturnValue({ 
            isAuthenticated: true,
            logout: vi.fn()
        });
        renderWithRouter(<Navbar />);
        
        // Open the mobile menu first to see the text "Account"
        const menuButton = screen.getByTestId('mobile-menu-button');
        fireEvent.click(menuButton);
        
        // Now we should be able to find the text
        expect(screen.getByText('Account')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
        expect(screen.getByText('Wish List')).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger button is clicked', () => {
        useAuth.mockReturnValue({ isAuthenticated: false });
        
        renderWithRouter(<Navbar />);
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
        const menuButton = screen.getByTestId('mobile-menu-button');
        fireEvent.click(menuButton);
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
        fireEvent.click(menuButton);
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
      });

    it('handles logout', async () => {
        const mockLogout = vi.fn().mockResolvedValue(undefined);
        useAuth.mockReturnValue({
          isAuthenticated: true,
          logout: mockLogout
        });
        
        renderWithRouter(<Navbar />);
        
        // Open the mobile menu
        const menuButton = screen.getByTestId('mobile-menu-button');
        fireEvent.click(menuButton);
        
        // Find and click the logout button using the test ID
        const logoutButton = screen.getByTestId('mobile-logout-button');
        fireEvent.click(logoutButton);
        
        expect(mockLogout).toHaveBeenCalled();
      });
});
