import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewsletterSignup } from '../NewsletterSignup';

vi.mock('../../../api/client', () => ({
  default: { post: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import apiClient from '../../../api/client';
import toast from 'react-hot-toast';

const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input and subscribe button', () => {
    render(<NewsletterSignup />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    render(<NewsletterSignup />);
    expect(screen.getByText('Fresh beans, first')).toBeInTheDocument();
  });

  it('calls API with email on submit', async () => {
    mockPost.mockResolvedValue({});
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/newsletter/subscribe', { email: 'test@example.com' });
    });
  });

  it('shows success state after successful subscription', async () => {
    mockPost.mockResolvedValue({});
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(screen.getByText(/you're on the list/i)).toBeInTheDocument();
    });
  });

  it('calls toast.success on successful subscription', async () => {
    mockPost.mockResolvedValue({});
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it('shows error toast when API call fails', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });
  });
});
