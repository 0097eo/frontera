import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmailVerificationPage from '../src/pages/VerifyEmail';
import * as useAuth from '../src/hooks/useAuth';

vi.mock('../src/hooks/useAuth', () => ({
  default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.default.mockReturnValue({ login: vi.fn() });

    // Mock fetch using vi.stubGlobal
    vi.stubGlobal('fetch', vi.fn());

    // Reset session storage
    sessionStorage.clear();
    sessionStorage.setItem('registrationEmail', 'test@example.com');
    sessionStorage.setItem('registrationPassword', 'password123');
  });

  afterEach(() => {
    // Clean up global fetch mock
    vi.unstubAllGlobals();
  });

  it('renders email verification form', () => {
    render(
      <BrowserRouter>
        <EmailVerificationPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
  });

  it('handles successful verification', async () => {
    const mockLogin = vi.fn().mockResolvedValue(true);
    useAuth.default.mockReturnValue({ login: mockLogin });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });

    render(
      <BrowserRouter>
        <EmailVerificationPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(screen.getByText('Email verified successfully!')).toBeInTheDocument();
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles verification error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid code' }),
    });

    render(
      <BrowserRouter>
        <EmailVerificationPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      // Find the error message within the error alert container
      const errorContainer = screen.getByTestId('error-alert') || screen.getByText('Invalid code').closest('div');
      expect(errorContainer).toHaveTextContent('Invalid code');
    });
  });

  it('handles resend verification code', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Email resent' }),
    });

    render(
      <BrowserRouter>
        <EmailVerificationPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(screen.getByText('Verification email resent successfully')).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <EmailVerificationPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      // Find the error message within the error alert container
      const errorContainer = screen.getByTestId('error-alert') || screen.getByText('Network error. Please try again later.').closest('div');
      expect(errorContainer).toHaveTextContent('Network error. Please try again later.');
    });
  });
});