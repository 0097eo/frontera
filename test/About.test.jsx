import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from '../src/pages/About';

describe('AboutPage', () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <AboutPage />
            </BrowserRouter>
        );
    });

    test('renders page title', () => {
        const aboutUsElements = screen.getAllByText('About Us');
        expect(aboutUsElements[0]).toBeInTheDocument(); 
    });

    test('renders Our Story section', () => {
        expect(screen.getByText('Our Story')).toBeInTheDocument();
        expect(screen.getByText(/Ideal Furniture & Decor began/)).toBeInTheDocument();
    });

    test('renders Our Values section with three values', () => {
        expect(screen.getByText('Our Values')).toBeInTheDocument();
        expect(screen.getByText('Quality')).toBeInTheDocument();
        expect(screen.getByText('Innovation')).toBeInTheDocument();
        expect(screen.getByText('Customer Focus')).toBeInTheDocument();
    });

    test('renders Meet Our Leader section', () => {
        expect(screen.getByText('Meet Our Leader')).toBeInTheDocument();
        expect(screen.getByText('Kennedy Odhiambo')).toBeInTheDocument();
    });

    test('renders showroom section', () => {
        expect(screen.getByText('Visit Our Showroom')).toBeInTheDocument();
        expect(screen.getByText('Nyamasaria, Kisumu, Kenya')).toBeInTheDocument();
    });

    test('renders call to action section with buttons', () => {
        expect(screen.getByText('Ready to Transform Your Space?')).toBeInTheDocument();
        expect(screen.getByText('Shop Now')).toBeInTheDocument();
        expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });
});