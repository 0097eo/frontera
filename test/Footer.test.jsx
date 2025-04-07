import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../src/components/Footer';

describe('Footer', () => {
    const renderFooter = () => {
        return render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
    };

    it('renders company name', () => {
        renderFooter();
        expect(screen.getByText('Ideal Furniture & Decor')).toBeInTheDocument();
    });

    it('renders company address', () => {
        renderFooter();
        expect(screen.getByText('Nyamasaria, Kisumu, Kenya')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        renderFooter();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Shop')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders newsletter section', () => {
        renderFooter();
        expect(screen.getByText('Newsletter')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Your Email Address')).toBeInTheDocument();
        expect(screen.getByText('SUBSCRIBE')).toBeInTheDocument();
    });

    it('renders copyright with current year', () => {
        renderFooter();
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} Ideal Furniture & Decor. All rights reserved.`)).toBeInTheDocument();
    });
});