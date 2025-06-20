import React, { useState, useEffect } from 'react';
import { Region } from '../../../context/PricingDataContext';

interface RegionManagerProps {
  regions: Region[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  onAddRegion: (region: Region) => void;
  onUpdateRegion: (regionId: string, updates: Partial<Region>) => void;
  onDeleteRegion: (regionId: string) => void;
  canEdit: boolean;
}

const RegionManager: React.FC<RegionManagerProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  onAddRegion,
  onUpdateRegion,
  onDeleteRegion,
  canEdit
}) => {
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [newRegion, setNewRegion] = useState<Region>({ id: '', name: '', countries: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRegionName, setEditRegionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);

  // Filter regions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRegions(regions);
    } else {
      const filtered = regions.filter(region => 
        region.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegions(filtered);
    }
  }, [regions, searchTerm]);

  const handleAddRegion = () => {
    if (!newRegion.id || !newRegion.name) {
      alert('Please provide both ID and name for the new region');
      return;
    }
    
    // Generate a URL-friendly ID if not provided
    const regionId = newRegion.id.toLowerCase().replace(/\s+/g, '-');
    
    onAddRegion({
      id: regionId,
      name: newRegion.name,
      countries: []
    });
    
    setNewRegion({ id: '', name: '', countries: [] });
    setIsAddingRegion(false);
  };

  const handleCancelAdd = () => {
    setIsAddingRegion(false);
    setNewRegion({ id: '', name: '', countries: [] });
  };

  const handleStartEdit = (region: Region) => {
    setEditingId(region.id);
    setEditRegionName(region.name);
  };

  const handleSaveEdit = (regionId: string) => {
    onUpdateRegion(regionId, { name: editRegionName });
    setEditingId(null);
    setEditRegionName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRegionName('');
  };

  const handleDeleteRegion = (regionId: string) => {
    if (window.confirm('Are you sure you want to delete this region? All associated countries and services will be deleted.')) {
      onDeleteRegion(regionId);
      if (selectedRegionId === regionId) {
        onSelectRegion('');
      }
    }
  };

  return (
    <div className="region-manager">
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
        }}>REGIONS</h2>
        {canEdit && (
          <button 
            className="add-button"
            onClick={() => setIsAddingRegion(true)}
            disabled={isAddingRegion}
          >
            Add Region
          </button>
        )}
      </div>

      {isAddingRegion && (
        <div className="region-form">
          <div className="form-group">
            <label>Region ID:</label>
            <input
              type="text"
              value={newRegion.id}
              onChange={(e) => setNewRegion({ ...newRegion, id: e.target.value })}
              placeholder="e.g., europe, africa"
            />
          </div>
          <div className="form-group">
            <label>Region Name:</label>
            <input
              type="text"
              value={newRegion.name}
              onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
              placeholder="e.g., Europe, Africa"
            />
          </div>
          <div className="form-buttons">
            <button onClick={handleAddRegion}>Save</button>
            <button onClick={handleCancelAdd}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="search-container mb-4">
        <input
          type="text"
          placeholder="Search regions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* List of regions */}
      <div className="region-list">
        {filteredRegions.length === 0 && searchTerm && (
          <div className="empty-message">No regions found matching "{searchTerm}"</div>
        )}
        {filteredRegions.length === 0 && !searchTerm && (
          <div className="empty-message">No regions defined</div>
        )}
        {filteredRegions.map(region => (
          <div 
            key={region.id} 
            className={`region-item ${selectedRegionId === region.id ? 'selected' : ''}`}
          >
            <div className="region-info" onClick={() => onSelectRegion(region.id)}>
              {editingId === region.id ? (
                <input
                  type="text"
                  value={editRegionName}
                  onChange={(e) => setEditRegionName(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className="region-name">{region.name}</span>
              )}
              <span className="region-countries-count">
                {region.countries.length} {region.countries.length === 1 ? 'country' : 'countries'}
              </span>
            </div>
            
            {canEdit && (
              <div className="region-actions">
                {editingId === region.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(region.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleStartEdit(region)}>Edit</button>
                    <button onClick={() => handleDeleteRegion(region.id)}>Delete</button>
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

export default RegionManager;
