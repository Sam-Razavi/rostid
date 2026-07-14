import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Modal content
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="My Dialog">
        Body
      </Modal>
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('does not render title heading when title is not provided', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Body
      </Modal>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('has role="dialog" and aria-modal="true"', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Dialog">
        Content
      </Modal>
    );
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when no title is given', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders into document.body via portal', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Portaled
      </Modal>
    );
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
