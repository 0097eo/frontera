import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../src/pages/Login';
import useAuth from '../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../src/hooks/useAuth');

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('renders login form elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input#password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input#password' }), { 
      target: { value: 'password123' } 
    });

    // Submit form - exact match for the button text
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    // Verify login was called with correct params
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    // Verify navigation occurred after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login failure', async () => {
    mockLogin.mockResolvedValueOnce({ success: false });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input#password' }), { 
      target: { value: 'wrongpassword' } 
    });


    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('handles unexpected errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input#password' }), { 
      target: { value: 'password123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    // Verify unexpected error message appears
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    // Get password input with more specific selector
    const passwordInput = screen.getByLabelText('Password', { selector: 'input#password' });
    
    // Find the toggle button with the correct aria-label
    const toggleButton = screen.getByRole('button', { 
      name: /show password|hide password/i 
    });

    // Password should initially be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays loading state during login attempt', async () => {
    // Create a promise that won't resolve immediately
    let resolveLogin;
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve;
    });
    
    mockLogin.mockReturnValueOnce(loginPromise);
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText('Password', { selector: 'input#password' }), { 
      target: { value: 'password123' } 
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    // Check for loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    // Resolve the login promise
    resolveLogin({ success: true });
    
    // Verify button text returns to normal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });
  });
});