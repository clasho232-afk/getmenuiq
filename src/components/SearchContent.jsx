import React, { useState } from 'react';
import MarketSearchPage from './MarketSearchPage';
import RestaurantProfilePage from './RestaurantProfilePage';

const SearchContent = () => {
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  if (selectedRestaurantId) {
    return (
      <RestaurantProfilePage 
        restaurantId={selectedRestaurantId} 
        onBack={() => setSelectedRestaurantId(null)} 
      />
    );
  }

  return (
    <MarketSearchPage 
      searchWhat={searchWhat}
      setSearchWhat={setSearchWhat}
      searchWhere={searchWhere}
      setSearchWhere={setSearchWhere}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      onSelectRestaurant={setSelectedRestaurantId}
    />
  );
};

export default SearchContent;
