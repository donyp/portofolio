import '@testing-library/jest-dom'
import { vi } from 'vitest'

const resolved = (data = []) => Promise.resolve({ data, error: null })

const queryBuilder = (data = []) => {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => resolved({})),
    insert: vi.fn(() => resolved(data)),
    update: vi.fn(() => builder),
    delete: vi.fn(() => resolved(data)),
    limit: vi.fn(() => resolved(data)),
  }
  // make builder itself awaitable
  builder.then = (resolve) => resolve({ data, error: null })
  return builder
}

vi.mock('../supabase', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { email: 'admin@test.com' } } } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn(() => queryBuilder([])),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.png' } })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  }

  return { supabase: mockSupabase }
})

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true, value: null }),
    showValidationMessage: vi.fn(),
  },
}))