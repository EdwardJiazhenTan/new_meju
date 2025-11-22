import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';

// Create mock router instance
const mockRouterInstance = {
  push: vi.fn(),
  refresh: vi.fn(),
};

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => mockRouterInstance),
}));

describe('LoginForm Component', () => {
  let mockSignIn: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const nextAuthModule = await import('next-auth/react');
    mockSignIn = nextAuthModule.signIn;
  });

  it('should render login form fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('should render Google login button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<LoginForm />);

    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    render(<LoginForm />);

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });

  it('should call signIn with credentials on form submit', async () => {
    vi.mocked(mockSignIn).mockResolvedValueOnce({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('should redirect to recipes page on successful login', async () => {
    vi.mocked(mockSignIn).mockResolvedValueOnce({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockRouterInstance.push).toHaveBeenCalledWith('/recipes');
      expect(mockRouterInstance.refresh).toHaveBeenCalled();
    });
  });

  it('should show error message on invalid credentials', async () => {
    vi.mocked(mockSignIn).mockResolvedValueOnce({ error: 'CredentialsSignin' });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    expect(mockRouterInstance.push).not.toHaveBeenCalled();
  });

  it('should show error message on network error', async () => {
    vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('Network error'));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should disable form during submission', async () => {
    vi.mocked(mockSignIn).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, error: null }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /^login$/i }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton.disabled).toBe(true);
      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
    });
  });

  it('should show loading state on login button', async () => {
    vi.mocked(mockSignIn).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, error: null }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    });
  });

  it('should clear previous error on new submission', async () => {
    vi.mocked(mockSignIn)
      .mockResolvedValueOnce({ error: 'CredentialsSignin' })
      .mockResolvedValueOnce({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    // First submission with error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    // Second submission should clear error
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  it('should call Google sign-in when Google button is clicked', async () => {
    render(<LoginForm />);

    const googleButton = screen.getByRole('button', { name: /login with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/recipes' });
    });
  });

  it('should disable Google button during form submission', async () => {
    vi.mocked(mockSignIn).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, error: null }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^login$/i });
    const googleButton = screen.getByRole('button', { name: /login with google/i }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(googleButton.disabled).toBe(true);
    });
  });

  it('should handle empty form submission', async () => {
    render(<LoginForm />);

    const form = screen.getByRole('button', { name: /^login$/i }).closest('form');

    // HTML5 validation should prevent submission with required fields empty
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('required');
  });

  it('should have proper input types', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });
});
