import { render, screen, waitFor } from '@testing-library/react'
import Admin from './Admin'

describe('Admin dashboard', () => {
  it('renders without crashing when authenticated', async () => {
    render(<Admin />)
    await waitFor(() => {
      expect(screen.getAllByText(/Skills & More/i).length).toBeGreaterThan(0)
    })
  })

  it('renders all admin menu tabs', async () => {
    render(<Admin />)
    await waitFor(() => {
      expect(screen.getAllByText(/Skills & More/i).length).toBeGreaterThan(0)
    })
    const menus = [
      'Dashboard',
      'Projects',
      'Skills & More',
      'General Comments',
      'Testimonials',
      'Services',
      'Timeline',
      'Analytics',
      'Activity Log',
      'Orders',
      'Settings',
    ]

    menus.forEach((menu) => {
      expect(screen.getAllByText(new RegExp(menu, 'i')).length).toBeGreaterThan(0)
    })
  })
})