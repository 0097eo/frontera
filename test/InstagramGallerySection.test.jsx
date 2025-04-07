import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InstagramGallerySection from '../src/components/InstagramGallerySection';

describe('InstagramGallerySection', () => {
    it('renders the section with correct heading', () => {
        render(<InstagramGallerySection />);
        expect(screen.getByText('#IdealFurniture&Decor')).toBeInTheDocument();
        expect(screen.getByText('Share your setup with')).toBeInTheDocument();
    });

    it('renders the Instagram icon', () => {
        render(<InstagramGallerySection />);
        // Since lucide-react icons are SVGs, look for the SVG element with specific classes
        const instagramIcon = screen.getByTestId('instagram-icon') || 
                            document.querySelector('svg.mr-4');
        expect(instagramIcon).toBeInTheDocument();
        expect(instagramIcon).toHaveAttribute('width', '32'); 
        expect(instagramIcon).toHaveAttribute('height', '32');
    });

    it('renders all 8 Instagram images', () => {
        render(<InstagramGallerySection />);
        const images = screen.getAllByRole('img').filter(img => img.hasAttribute('src'));
        expect(images).toHaveLength(8);
        
        images.forEach(img => {
            expect(img).toHaveAttribute('alt', 'Instagram post');
            expect(img).toHaveAttribute('src');
            expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
        });
    });

    it('renders with correct layout classes', () => {
        render(<InstagramGallerySection />);
        const section = screen.getByRole('region', { name: /instagram gallery/i }) || 
                       document.querySelector('section.my-16');
        expect(section).toHaveClass('my-16', 'max-w-7xl', 'mx-auto', 'px-4');
        
        const heading = screen.getByRole('heading', { name: '#IdealFurniture&Decor' });
        expect(heading).toHaveClass('text-3xl', 'font-bold');
    });
});