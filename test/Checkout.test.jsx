import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../src/pages/Checkout';
import useCart from '../src/hooks/useCart';
import axios from 'axios';
import  {toast } from "sonner"

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('../src/hooks/useCart');
vi.mock('axios');
vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
    Toaster: () => null
}));

describe('CheckoutPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({
            items: [{ id: 1, name: 'Test Item', price: 1000, quantity: 2 }],
            total: 2000,
            loading: false,
            clearCart: vi.fn()
        });
    });

    test('renders checkout form correctly', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Billing details')).toBeInTheDocument();
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    test('handles form input changes', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const firstNameInput = screen.getByLabelText('First Name');
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        expect(firstNameInput.value).toBe('John');
    });

    test('displays loading state', () => {
        useCart.mockReturnValue({
            items: [],
            total: 0,
            loading: true,
            clearCart: vi.fn()
        });

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('handles form submission with missing required fields', async () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const submitButton = screen.getByText('Place Order');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Please fill in all required fields',
                expect.any(Object)
            );
        });
    });

    test('calculates shipping fee correctly', () => {
        useCart.mockReturnValue({
            items: [{ id: 1, name: 'Test Item', price: 6000, quantity: 1 }],
            total: 6000,
            loading: false,
            clearCart: vi.fn()
        });

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Free')).toBeInTheDocument();
    });

    test('handles payment method change', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const cashOnDeliveryRadio = screen.getByLabelText('Cash on Delivery');
        fireEvent.click(cashOnDeliveryRadio);
        expect(cashOnDeliveryRadio).toBeChecked();
    });

    test('handles successful order submission', async () => {
        const mockResponse = { status: 201, data: { id: 1 } };
        axios.post.mockResolvedValueOnce(mockResponse);
        localStorage.setItem('access', 'mock-token');

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        // Fill in required fields
        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByLabelText('Town / City'), { target: { value: 'Test City' } });
        fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'nairobi' } });
        fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@test.com' } });

        const submitButton = screen.getByText('Place Order');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(useCart().clearCart).toHaveBeenCalled();
        });
    });
});