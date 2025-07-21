import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../src/pages/Contact';

describe('ContactPage', () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <ContactPage />
            </BrowserRouter>
        );
    });

    test('renders contact form with all fields', () => {
        expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    test('updates form fields when user types', () => {
        const nameInput = screen.getByLabelText(/your name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const messageInput = screen.getByLabelText(/message/i);

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        expect(nameInput.value).toBe('John Doe');
        expect(emailInput.value).toBe('john@example.com');
        expect(messageInput.value).toBe('Test message');
    });

    test('opens gmail compose window on form submission', () => {
        window.open = vi.fn();
        
        const nameInput = screen.getByLabelText(/your name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const messageInput = screen.getByLabelText(/message/i);
        const submitButton = screen.getByRole('button', { name: /submit/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        fireEvent.click(submitButton);

        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('mail.google.com/mail/?view=cm'),
            '_blank'
        );
    });

    test('sets document title on mount', () => {
        expect(document.title).toBe('Contact | Ideal Furniture & Decor');
    });
});