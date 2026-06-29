export const initialCustomers = [
  {
    id: 'CUS-001',
    company: 'Northstar Foods',
    contactName: 'Olivia Hart',
    phone: '(555) 014-1001',
    email: 'ops@northstar.example',
    status: 'Active',
  },
  {
    id: 'CUS-002',
    company: 'Harbor Home Goods',
    contactName: 'Sofia Davis',
    phone: '(555) 014-1002',
    email: 'shipping@harborhome.example',
    status: 'Active',
  },
  {
    id: 'CUS-003',
    company: 'Summit Medical Supply',
    contactName: 'Henry Park',
    phone: '(555) 014-1003',
    email: 'logistics@summitmed.example',
    status: 'Needs Review',
  },
]

export const initialRoutes = [
  {
    id: 'RTE-001',
    name: 'Dallas to Atlanta',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    distanceMiles: 781,
    estimatedHours: 12.5,
    status: 'Active',
  },
  {
    id: 'RTE-002',
    name: 'Savannah to Charlotte',
    origin: 'Savannah, GA',
    destination: 'Charlotte, NC',
    distanceMiles: 252,
    estimatedHours: 4.5,
    status: 'Active',
  },
  {
    id: 'RTE-003',
    name: 'Denver to Salt Lake City',
    origin: 'Denver, CO',
    destination: 'Salt Lake City, UT',
    distanceMiles: 518,
    estimatedHours: 8.5,
    status: 'Draft',
  },
]

export const initialTrips = [
  {
    id: 'TRP-001',
    customer: 'Northstar Foods',
    route: 'Dallas to Atlanta',
    vehicle: 'Tractor 118',
    driver: 'Andre Miller',
    scheduledDate: '2026-07-01',
    status: 'Scheduled',
  },
  {
    id: 'TRP-002',
    customer: 'Harbor Home Goods',
    route: 'Savannah to Charlotte',
    vehicle: 'Tractor 101',
    driver: 'Maria Santos',
    scheduledDate: '2026-07-02',
    status: 'In Transit',
  },
  {
    id: 'TRP-003',
    customer: 'Summit Medical Supply',
    route: 'Denver to Salt Lake City',
    vehicle: 'Trailer 510',
    driver: 'Ethan Cole',
    scheduledDate: '2026-07-03',
    status: 'Delayed',
  },
]
