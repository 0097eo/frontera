import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShareComponent from '../src/components/Share'

describe('ShareComponent', () => {
    beforeEach(() => {
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: { href: 'http://test.com/product' },
            writable: true
        })

        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn()
            }
        })

        // Mock window.open
        window.open = vi.fn()
    })

    it('renders share button', () => {
        render(<ShareComponent />)
        expect(screen.getByText('Share')).toBeInTheDocument()
    })

    it('shows share menu when clicking share button', () => {
        render(<ShareComponent />)
        fireEvent.click(screen.getByText('Share'))
        expect(screen.getByText('Share This Product')).toBeInTheDocument()
    })

    it('closes share menu when clicking close button', () => {
        render(<ShareComponent />)
        fireEvent.click(screen.getByText('Share'))
        fireEvent.click(screen.getByTitle('Close'))
        expect(screen.queryByText('Share This Product')).not.toBeInTheDocument()
    })

    it('uses product name in share title when provided', () => {
        const product = { name: 'Test Product' }
        render(<ShareComponent product={product} />)
        fireEvent.click(screen.getByText('Share'))
        
        const twitterLink = screen.getByTitle('Twitter').getAttribute('href')
        expect(twitterLink).toContain(encodeURIComponent('Test Product'))
    })

    it('copies link to clipboard when clicking Copy Link', async () => {
        render(<ShareComponent />)
        fireEvent.click(screen.getByText('Share'))
        fireEvent.click(screen.getByTitle('Copy Link'))
        
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://test.com/product')
    })

    it('opens WhatsApp share window when clicking WhatsApp button', () => {
        render(<ShareComponent />)
        fireEvent.click(screen.getByText('Share'))
        fireEvent.click(screen.getByTitle('WhatsApp'))
        
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('web.whatsapp.com/send?text='),
            '_blank'
        )
    })

    it('opens email compose window when clicking Email button', () => {
        render(<ShareComponent />)
        fireEvent.click(screen.getByText('Share'))
        fireEvent.click(screen.getByTitle('Email'))
        
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('mail.google.com/mail/?view=cm'),
            '_blank'
        )
    })
})