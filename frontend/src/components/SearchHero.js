import React, { useState } from 'react';
import './SearchHero.css';
import { FiSearch } from 'react-icons/fi';

const SearchHero = ({ onSearch, suggestions, onSelectSuggestion }) => {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = e => {
    setValue(e.target.value);
    setShowDropdown(true);
    onSearch && onSearch(e.target.value);
  };

  const handleSelect = (s) => {
    setValue(s);
    setShowDropdown(false);
    onSelectSuggestion && onSelectSuggestion(s);
  };

  return (
    <section className="ev-search-hero">
      <div className="ev-search-bar">
        <FiSearch className="ev-search-icon" />
        <input
          type="text"
          placeholder="Search for EV datasets..."
          value={value}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && suggestions && suggestions.length > 0 && (
          <ul className="ev-search-suggest">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => handleSelect(s)}>{s}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SearchHero;
