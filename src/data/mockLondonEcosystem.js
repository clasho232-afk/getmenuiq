export const mockLondonEcosystem = [
  {
    id: 1,
    name: 'Pizza Express Whitechapel',
    category: 'Restaurant',
    cuisine: 'Italian',
    location: 'Whitechapel',
    postcodes: ['E1', 'E2', 'E1W'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    deliveryPlatforms: ['UberEats', 'Deliveroo'],
    topDishes: [
      { id: 101, name: 'Margherita Pizza', price: '£11.95', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 102, name: 'American Hot', price: '£14.95', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 103, name: 'Dough Balls', price: '£4.95', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ],
    promos: [
      { id: 201, title: 'Buy 1 Get 1 Free', type: 'Offer', description: 'Valid on all classic pizzas', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 202, title: '20% off over £20', type: 'Discount', description: 'Only on Deliveroo', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 2,
    name: 'Shoreditch Grind',
    category: 'Restaurant',
    cuisine: 'Coffee & Brunch',
    location: 'Shoreditch',
    postcodes: ['EC1', 'EC2', 'E1'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    deliveryPlatforms: ['Deliveroo'],
    topDishes: [
      { id: 104, name: 'Avocado on Toast', price: '£9.50', image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 105, name: 'Flat White', price: '£3.50', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 106, name: 'Full English', price: '£14.00', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ],
    promos: [
      { id: 203, title: 'Free Coffee', type: 'Offer', description: 'With any brunch item before 11am', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 3,
    name: 'Dishoom Shoreditch',
    category: 'Restaurant',
    cuisine: 'Indian',
    location: 'Shoreditch',
    postcodes: ['EC1', 'EC2', 'E1', 'E2'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    deliveryPlatforms: ['Deliveroo', 'JustEat'],
    topDishes: [
      { id: 107, name: 'Black Daal', price: '£7.90', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 108, name: 'Chicken Ruby', price: '£14.90', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 109, name: 'Garlic Naan', price: '£3.90', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ],
    promos: []
  },
  {
    id: 4,
    name: 'Tayyabs',
    category: 'Restaurant',
    cuisine: 'Pakistani',
    location: 'Whitechapel',
    postcodes: ['E1', 'E1W'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    deliveryPlatforms: ['UberEats'],
    topDishes: [
      { id: 110, name: 'Lamb Chops', price: '£8.50', image: 'https://images.unsplash.com/photo-1544025162-8111f4a7615a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 111, name: 'Dry Meat', price: '£11.00', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
      { id: 112, name: 'Mixed Grill', price: '£18.00', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ],
    promos: [
      { id: 204, title: '10% Off First Order', type: 'Discount', description: 'Available on UberEats', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
    ]
  }
];
