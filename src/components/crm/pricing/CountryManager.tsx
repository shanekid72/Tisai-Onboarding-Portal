import React, { useState, useEffect } from 'react';
import { Country } from '../../../context/PricingDataContext';

interface CountryManagerProps {
  countries: Country[];
  selectedCountryCode: string | null;
  onSelectCountry: (countryCode: string) => void;
  onAddCountry: (country: Country) => void;
  onUpdateCountry: (countryCode: string, updates: Partial<Country>) => void;
  onDeleteCountry: (countryCode: string) => void;
  canEdit: boolean;
}

const CountryManager: React.FC<CountryManagerProps> = ({
  countries,
  selectedCountryCode,
  onSelectCountry,
  onAddCountry,
  onUpdateCountry,
  onDeleteCountry,
  canEdit
}) => {
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState<string | null>(null);
  const [editCountryName, setEditCountryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);
  
  const handleAddCountry = () => {
    if (!newCountryCode || !newCountryName) {
      alert('Please provide both code and name for the new country');
      return;
    }

    if (newCountryCode.length !== 2) {
      alert('Country code must be a 2-character ISO code (e.g., US, GB, DE)');
      return;
    }
    
    onAddCountry({
      code: newCountryCode.toUpperCase(),
      name: newCountryName,
      services: []
    });
    
    setNewCountryCode('');
    setNewCountryName('');
    setIsAddingCountry(false);
  };

  const handleCancelAdd = () => {
    setIsAddingCountry(false);
    setNewCountryCode('');
    setNewCountryName('');
  };

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [countries, searchTerm]);

  const handleStartEdit = (country: Country) => {
    setEditCountryCode(country.code);
    setEditCountryName(country.name);
  };

  const handleSaveEdit = (countryCode: string) => {
    onUpdateCountry(countryCode, { name: editCountryName });
    setEditCountryCode(null);
    setEditCountryName('');
  };

  const handleCancelEdit = () => {
    setEditCountryCode(null);
    setEditCountryName('');
  };

  const handleDeleteCountry = (countryCode: string) => {
    if (window.confirm('Are you sure you want to delete this country? All associated services will be deleted.')) {
      onDeleteCountry(countryCode);
      if (selectedCountryCode === countryCode) {
        onSelectCountry('');
      }
    }
  };

  if (!countries || countries.length === 0) {
    return (
      <div className="country-manager">
        <div className="country-header">
          <h2>Countries</h2>
          {canEdit && (
            <button
              className="add-button"
              onClick={() => setIsAddingCountry(true)}
              disabled={isAddingCountry}
            >
              Add Country
            </button>
          )}
        </div>
        <div className="empty-message">
          {canEdit 
            ? 'Select a region and add countries to it'
            : 'No countries in this region'}
        </div>
        
        {isAddingCountry && (
          <div className="country-form">
            <div className="form-group">
              <label>Country Code (ISO 2-letter):</label>
              <input
                type="text"
                value={newCountryCode}
                onChange={(e) => setNewCountryCode(e.target.value)}
                placeholder="e.g., US, GB"
                maxLength={2}
              />
            </div>
            <div className="form-group">
              <label>Country Name:</label>
              <input
                type="text"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                placeholder="e.g., United States, United Kingdom"
              />
            </div>
            <div className="form-buttons">
              <button onClick={handleAddCountry}>Save</button>
              <button onClick={handleCancelAdd}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="country-manager">
      <div style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '20px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
        <h2 style={{
          margin: 0,
          fontSize: '22px',
          fontWeight: 700,
          color: 'white',
          textTransform: 'uppercase'
        }}>COUNTRIES</h2>
        {canEdit && (
          <button
            className="add-button"
            onClick={() => setIsAddingCountry(true)}
            disabled={isAddingCountry}
          >
            Add Country
          </button>
        )}
      </div>

      {isAddingCountry && (
        <div className="country-form">
          <div className="form-group">
            <label>Country Code (ISO 2-letter):</label>
            <input
              type="text"
              value={newCountryCode}
              onChange={(e) => setNewCountryCode(e.target.value)}
              placeholder="e.g., US, GB"
              maxLength={2}
            />
          </div>
          <div className="form-group">
            <label>Country Name:</label>
            <input
              type="text"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              placeholder="e.g., United States, United Kingdom"
            />
          </div>
          <div className="form-buttons">
            <button onClick={handleAddCountry}>Save</button>
            <button onClick={handleCancelAdd}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="search-container mb-4">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="country-list">
        {filteredCountries.length === 0 && searchTerm && (
          <div className="empty-message">No countries found matching "{searchTerm}"</div>
        )}
        {filteredCountries.length === 0 && !searchTerm && (
          <div className="no-items-message">
            <p>No countries defined for this region</p>
            <p>Select a region and add countries to get started</p>
          </div>
        )}
        {filteredCountries.map((country) => (
          <div
            key={country.code}
            className={`country-item ${selectedCountryCode === country.code ? 'selected' : ''}`}
          >
            <div className="country-info" onClick={() => onSelectCountry(country.code)}>
              {editCountryCode === country.code ? (
                <input
                  type="text"
                  value={editCountryName}
                  onChange={(e) => setEditCountryName(e.target.value)}
                  autoFocus
                />
              ) : (
                <>
                  <span className="country-flag">{country.code}</span>
                  <span className="country-name">{country.name}</span>
                </>
              )}
              <span className="country-services-count">
                {country.services.length} {country.services.length === 1 ? 'service' : 'services'}
              </span>
            </div>

            {canEdit && (
              <div className="country-actions">
                {editCountryCode === country.code ? (
                  <>
                    <button onClick={() => handleSaveEdit(country.code)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleStartEdit(country)}>Edit</button>
                    <button onClick={() => handleDeleteCountry(country.code)}>Delete</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryManager;
