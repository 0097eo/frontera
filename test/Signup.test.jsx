import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../src/pages/Signup';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear session storage between tests
        sessionStorage.clear();
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
    });

    it('renders signup form elements', () => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByRole('button', { name: '' });

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('handles form submission successfully', async () => {
        window.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            })
        );

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+1234567890' } });

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/verify');
            expect(sessionStorage.getItem('registrationEmail')).toBe('john@example.com');
            expect(sessionStorage.getItem('registrationPassword')).toBe('password123');
        });
    });

    it('handles network error', async () => {
        // Mock the fetch function to reject with an error
        window.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

        // Fill out form with required fields to avoid validation errors
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText('Network error. Please try again later.')).toBeInTheDocument();
        });
    });

    it('handles API error response', async () => {
        // Mock the fetch function to resolve with an error response
        window.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Registration failed' }),
            })
        );

        // Fill out form with required fields
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });

    it('handles specific email validation error from API', async () => {
        // Mock the fetch function to resolve with a specific email error
        window.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ email: ['Email already exists'] }),
            })
        );

        // Fill out form
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Wait for the specific error message to appear
        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument();
        });
    });
});