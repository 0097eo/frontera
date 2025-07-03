import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../src/pages/Checkout';
import useCart from '../src/hooks/useCart';
import axios from 'axios';
import { toast } from "sonner";


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
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
        localStorage.clear();
    });

    it('renders checkout form correctly', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Billing details')).toBeInTheDocument();
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    });

    it('handles form input changes', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const firstNameInput = screen.getByLabelText(/First Name/i);
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        expect(firstNameInput.value).toBe('John');
    });

    it('displays loading state when cart is loading', () => {
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

    it('shows an error toast and navigates away if cart is empty', () => {
        useCart.mockReturnValue({
            items: [],
            total: 0,
            loading: false,
            clearCart: vi.fn()
        });

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(toast.error).toHaveBeenCalledWith("Your cart is empty", expect.any(Object));
        expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });

    it('shows an error toast on submit if required fields are missing', async () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button', { name: 'Place Order' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Please fill in all required fields',
                expect.any(Object)
            );
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('calculates shipping fee correctly (free for orders >= 50000)', () => {
        useCart.mockReturnValue({
            items: [{ id: 1, name: 'Test Item', price: 60000, quantity: 1 }],
            total: 60000,
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

    it('calculates shipping fee correctly (paid for orders < 50000)', () => {
        useCart.mockReturnValue({
            items: [{ id: 1, name: 'Test Item', price: 1000, quantity: 1 }],
            total: 1000,
            loading: false,
            clearCart: vi.fn()
        });

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/Ksh 1,500.00/)).toBeInTheDocument();
    });

    it('handles payment method change', () => {
        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        const cashOnDeliveryRadio = screen.getByLabelText('Cash on Delivery');
        expect(cashOnDeliveryRadio).not.toBeChecked();
        fireEvent.click(cashOnDeliveryRadio);
        expect(cashOnDeliveryRadio).toBeChecked();
    });

    it('handles successful order submission and redirects', async () => {
        axios.post.mockResolvedValue({ status: 201, data: { id: 'order-123' } });
        localStorage.setItem('access', 'mock-token');
        const { clearCart } = useCart();

        render(
            <BrowserRouter>
                <CheckoutPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Country \/ Region/i), { target: { value: 'kenya' } });
        fireEvent.change(screen.getByLabelText(/Street address/i), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByLabelText(/Town \/ City/i), { target: { value: 'Test City' } });
        fireEvent.change(screen.getByLabelText(/Province/i), { target: { value: 'nairobi' } });
        fireEvent.change(screen.getByLabelText(/ZIP code/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '254712345678' } });
        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } });

        const submitButton = screen.getByRole('button', { name: 'Place Order' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/orders/orders/create/',
                expect.any(Object),
                expect.any(Object)
            );

            expect(clearCart).toHaveBeenCalled();

            expect(toast.success).toHaveBeenCalledWith('Order placed successfully!');

            expect(mockNavigate).toHaveBeenCalledWith('/order-confirmation/order-123', expect.any(Object));
        });
    });
});