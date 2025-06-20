import React, { useState, useEffect } from 'react';
import { Service } from '../../../context/PricingDataContext';
import '../../../pages/crm/PricingManagementPage.css';

interface ServiceManagerProps {
  services: Service[];
  onAddService: (service: Service) => void;
  onUpdateService: (serviceId: string, updates: Partial<Service>) => void;
  onDeleteService: (serviceId: string) => void;
  canEdit: boolean;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  canEdit
}) => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form states for new service
  const [newService, setNewService] = useState<Partial<Service>>({
    id: '',
    name: '',
    type: 'bank-payout',
    currency: 'USD',
    coverage: 'Selected banks',
    transactionLimit: { min: 1, max: 10000 },
    tat: 'T+1',
    feeStructure: { fixed: 0, percentage: 0, currency: 'USD' }
  });
  
  // Form states for editing service
  const [editService, setEditService] = useState<Partial<Service>>({});
  
  const handleInputChange = (field: keyof Service, value: any) => {
    setNewService(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEditChange = (field: keyof Service, value: any) => {
    setEditService(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    if (parent === 'transactionLimit') {
      setNewService(prev => ({
        ...prev,
        transactionLimit: {
          min: prev.transactionLimit?.min ?? 1,
          max: prev.transactionLimit?.max ?? 10000,
          [field]: parseFloat(value) || 0
        }
      }));
    } else if (parent === 'feeStructure') {
      setNewService(prev => ({
        ...prev,
        feeStructure: {
          fixed: prev.feeStructure?.fixed ?? 0,
          percentage: prev.feeStructure?.percentage ?? 0,
          currency: prev.feeStructure?.currency ?? 'USD',
          [field]: field === 'currency' ? value : parseFloat(value) || 0
        }
      }));
    }
  };
  
  const handleNestedEditChange = (parent: string, field: string, value: any) => {
    if (parent === 'transactionLimit') {
      setEditService(prev => ({
        ...prev,
        transactionLimit: {
          min: prev.transactionLimit?.min ?? 1,
          max: prev.transactionLimit?.max ?? 10000,
          [field]: parseFloat(value) || 0
        }
      }));
    } else if (parent === 'feeStructure') {
      setEditService(prev => ({
        ...prev,
        feeStructure: {
          fixed: prev.feeStructure?.fixed ?? 0,
          percentage: prev.feeStructure?.percentage ?? 0,
          currency: prev.feeStructure?.currency ?? 'USD',
          [field]: field === 'currency' ? value : parseFloat(value) || 0
        }
      }));
    }
  };
  
  const handleAddService = () => {
    // Reset previous errors
    const errors: Record<string, string> = {};
    
    // Validate ID and name
    if (!newService.id) {
      errors.id = 'Service ID is required';
    } else if (!/^[a-z0-9-]+$/.test(newService.id)) {
      errors.id = 'ID must contain only lowercase letters, numbers, and hyphens';
    }
    
    if (!newService.name) {
      errors.name = 'Service name is required';
    }
    
    // Validate other required fields
    if (!newService.currency) {
      errors.currency = 'Currency is required';
    } else if (!/^[A-Z]{3}$/.test(newService.currency)) {
      errors.currency = 'Currency must be a 3-letter code (e.g., USD, EUR)';
    }
    
    if (!newService.tat) {
      errors.tat = 'Turn-around time is required';
    }
    
    if (!newService.coverage) {
      errors.coverage = 'Coverage information is required';
    }
    
    // Validate transaction limits
    if (!newService.transactionLimit) {
      errors.transactionLimit = 'Transaction limits are required';
    } else {
      if (newService.transactionLimit.min <= 0) {
        errors.minTransaction = 'Minimum transaction must be greater than 0';
      }
      if (newService.transactionLimit.max <= 0) {
        errors.maxTransaction = 'Maximum transaction must be greater than 0';
      }
      if (newService.transactionLimit.min >= newService.transactionLimit.max) {
        errors.transactionLimitRange = 'Maximum transaction must be greater than minimum transaction';
      }
    }
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    onAddService(newService as Service);
    
    // Reset form
    setNewService({
      id: '',
      name: '',
      type: 'bank-payout',
      currency: 'USD',
      coverage: 'Selected banks',
      transactionLimit: { min: 1, max: 10000 },
      tat: 'T+1',
      feeStructure: { fixed: 0, percentage: 0, currency: 'USD' }
    });
    
    setIsAddingService(false);
  };
  
  const handleStartEdit = (service: Service) => {
    setEditServiceId(service.id);
    setEditService(JSON.parse(JSON.stringify(service))); // Deep clone
  };
  
  const handleSaveEdit = (serviceId: string) => {
    // Validate edit fields before saving
    const errors: Record<string, string> = {};
    
    if (!editService.name) {
      errors.editName = 'Service name is required';
    }
    
    if (!editService.currency) {
      errors.editCurrency = 'Currency is required';
    } else if (!/^[A-Z]{3}$/.test(editService.currency)) {
      errors.editCurrency = 'Currency must be a 3-letter code (e.g., USD, EUR)';
    }
    
    if (!editService.coverage) {
      errors.editCoverage = 'Coverage information is required';
    }
    
    if (!editService.tat) {
      errors.editTat = 'Turn-around time is required';
    }
    
    // Check transaction limits
    if (editService.transactionLimit) {
      if (editService.transactionLimit.min <= 0) {
        errors.editMinTransaction = 'Minimum transaction must be greater than 0';
      }
      if (editService.transactionLimit.max <= 0) {
        errors.editMaxTransaction = 'Maximum transaction must be greater than 0';
      }
      if (editService.transactionLimit.min >= editService.transactionLimit.max) {
        errors.editTransactionLimitRange = 'Maximum transaction must be greater than minimum transaction';
      }
    }
    
    // If there are validation errors, set them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // No errors, proceed with update
    onUpdateService(serviceId, editService);
    setEditServiceId(null);
    setEditService({});
    setFormErrors({});
  };
  
  const handleCancelEdit = () => {
    setEditServiceId(null);
    setEditService({});
    setFormErrors({});
  };
  
  const handleCancelAdd = () => {
    setIsAddingService(false);
    setNewService({
      id: '',
      name: '',
      type: 'bank-payout',
      currency: 'USD',
      coverage: 'Selected banks',
      transactionLimit: { min: 1, max: 10000 },
      tat: 'T+1',
      feeStructure: { fixed: 0, percentage: 0, currency: 'USD' }
    });
    setFormErrors({});
  };
  
  // Filter services based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [services, searchTerm]);
  
  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      onDeleteService(serviceId);
    }
  };

  return (
    <div className="service-manager">
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
        }}>PAYMENT SERVICES</h2>
        {canEdit && (
          <button
            className="add-button"
            onClick={() => setIsAddingService(true)}
            disabled={isAddingService}
          >
            Add Service
          </button>
        )}
      </div>
      
      {/* Search bar */}
      {!isAddingService && (
        <div className="search-container mb-4">
          <input
            type="text"
            placeholder="Search services by name, ID, type, or currency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {isAddingService && (
        <div className="service-form">
          <h3>Add New Service</h3>
          
          <div className="form-group">
            <label>Service ID:</label>
            <input
              type="text"
              value={newService.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              placeholder="e.g., bank-payout-us-ach"
              className={formErrors.id ? 'input-error' : ''}
            />
            {formErrors.id && <div className="error-message">{formErrors.id}</div>}
          </div>
          
          <div className="form-group">
            <label>Service Name:</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., ACH Transfer"
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Type:</label>
              <select 
                value={newService.type} 
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="bank-payout">Bank Payout</option>
                <option value="wallet-payout">Wallet Payout</option>
                <option value="mobile-money">Mobile Money</option>
                <option value="card-payment">Card Payment</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Currency:</label>
              <input
                type="text"
                value={newService.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                placeholder="e.g., USD, EUR"
                className={formErrors.currency ? 'input-error' : ''}
              />
              {formErrors.currency && <div className="error-message">{formErrors.currency}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Coverage:</label>
            <input
              type="text"
              value={newService.coverage}
              onChange={(e) => handleInputChange('coverage', e.target.value)}
              placeholder="e.g., All US banks"
              className={formErrors.coverage ? 'input-error' : ''}
            />
            {formErrors.coverage && <div className="error-message">{formErrors.coverage}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Min Transaction Amount:</label>
              <input
                type="number"
                value={newService.transactionLimit?.min}
                onChange={(e) => handleNestedInputChange('transactionLimit', 'min', e.target.value)}
                className={formErrors.minTransaction ? 'input-error' : ''}
              />
              {formErrors.minTransaction && <div className="error-message">{formErrors.minTransaction}</div>}
            </div>
            
            <div className="form-group">
              <label>Max Transaction Amount:</label>
              <input
                type="number"
                value={newService.transactionLimit?.max}
                onChange={(e) => handleNestedInputChange('transactionLimit', 'max', e.target.value)}
                className={formErrors.maxTransaction ? 'input-error' : ''}
              />
              {formErrors.maxTransaction && <div className="error-message">{formErrors.maxTransaction}</div>}
              {formErrors.transactionLimitRange && <div className="error-message">{formErrors.transactionLimitRange}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Turnaround Time (TAT):</label>
            <input
              type="text"
              value={newService.tat}
              onChange={(e) => handleInputChange('tat', e.target.value)}
              placeholder="e.g., T+1, Same Day, Real Time"
              className={formErrors.tat ? 'input-error' : ''}
            />
            {formErrors.tat && <div className="error-message">{formErrors.tat}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fixed Fee:</label>
              <input
                type="number"
                step="0.01"
                value={newService.feeStructure?.fixed}
                onChange={(e) => handleNestedInputChange('feeStructure', 'fixed', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Percentage Fee (%):</label>
              <input
                type="number"
                step="0.01"
                value={newService.feeStructure?.percentage}
                onChange={(e) => handleNestedInputChange('feeStructure', 'percentage', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Fee Currency:</label>
              <input
                type="text"
                value={newService.feeStructure?.currency}
                onChange={(e) => handleNestedInputChange('feeStructure', 'currency', e.target.value)}
                placeholder="e.g., USD, EUR"
              />
            </div>
          </div>
          
          <div className="form-buttons">
            <button onClick={handleAddService}>Save Service</button>
            <button onClick={handleCancelAdd}>Cancel</button>
          </div>
        </div>
      )}

      <div className="service-list">
        {filteredServices.length === 0 && searchTerm && (
          <div className="no-items-message">
            <p>No services match your search</p>
            <p>Try adjusting your search terms</p>
          </div>
        )}
        {filteredServices.length === 0 && !searchTerm && (
          <div className="no-items-message">
            <p>No services defined for this country</p>
            <p>Select a country and add services to get started</p>
          </div>
        )}
        {filteredServices.length > 0 && (
          filteredServices.map((service) => (
            <div key={service.id} className="service-item">
              {editServiceId === service.id ? (
                <div className="service-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Service Name:</label>
                      <input
                        type="text"
                        value={editService.name || ''}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        className={formErrors.editName ? 'input-error' : ''}
                      />
                      {formErrors.editName && <div className="error-message">{formErrors.editName}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Type:</label>
                      <select 
                        value={editService.type || ''} 
                        onChange={(e) => handleEditChange('type', e.target.value)}
                      >
                        <option value="bank-payout">Bank Payout</option>
                        <option value="wallet-payout">Wallet Payout</option>
                        <option value="mobile-money">Mobile Money</option>
                        <option value="card-payment">Card Payment</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Currency:</label>
                      <input
                        type="text"
                        value={editService.currency || ''}
                        onChange={(e) => handleEditChange('currency', e.target.value)}
                        className={formErrors.editCurrency ? 'input-error' : ''}
                      />
                      {formErrors.editCurrency && <div className="error-message">{formErrors.editCurrency}</div>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Coverage:</label>
                      <input
                        type="text"
                        value={editService.coverage || ''}
                        onChange={(e) => handleEditChange('coverage', e.target.value)}
                        className={formErrors.editCoverage ? 'input-error' : ''}
                      />
                      {formErrors.editCoverage && <div className="error-message">{formErrors.editCoverage}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Min Amount:</label>
                        <input
                          type="number"
                          value={editService.transactionLimit?.min || ''}
                          onChange={(e) => handleNestedEditChange('transactionLimit', 'min', e.target.value)}
                          className={formErrors.editMinTransaction ? 'input-error' : ''}
                        />
                        {formErrors.editMinTransaction && <div className="error-message">{formErrors.editMinTransaction}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Max Amount:</label>
                        <input
                          type="number"
                          value={editService.transactionLimit?.max || ''}
                          onChange={(e) => handleNestedEditChange('transactionLimit', 'max', e.target.value)}
                          className={formErrors.editMaxTransaction ? 'input-error' : ''}
                        />
                        {formErrors.editMaxTransaction && <div className="error-message">{formErrors.editMaxTransaction}</div>}
                        {formErrors.editTransactionLimitRange && <div className="error-message">{formErrors.editTransactionLimitRange}</div>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Turnaround Time:</label>
                      <input
                        type="text"
                        value={editService.tat || ''}
                        onChange={(e) => handleEditChange('tat', e.target.value)}
                        className={formErrors.editTat ? 'input-error' : ''}
                      />
                      {formErrors.editTat && <div className="error-message">{formErrors.editTat}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fixed Fee:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editService.feeStructure?.fixed || 0}
                          onChange={(e) => handleNestedEditChange('feeStructure', 'fixed', e.target.value)}
                          className={formErrors.editFixedFee ? 'input-error' : ''}
                        />
                        {formErrors.editFixedFee && <div className="error-message">{formErrors.editFixedFee}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Percentage (%):</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editService.feeStructure?.percentage || 0}
                          onChange={(e) => handleNestedEditChange('feeStructure', 'percentage', e.target.value)}
                          className={formErrors.editPercentageFee ? 'input-error' : ''}
                        />
                        {formErrors.editPercentageFee && <div className="error-message">{formErrors.editPercentageFee}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Fee Currency:</label>
                        <input
                          type="text"
                          value={editService.feeStructure?.currency || ''}
                          onChange={(e) => handleNestedEditChange('feeStructure', 'currency', e.target.value)}
                          className={formErrors.editFeeCurrency ? 'input-error' : ''}
                        />
                        {formErrors.editFeeCurrency && <div className="error-message">{formErrors.editFeeCurrency}</div>}
                    </div>
                  </div>
                  
                  <div className="form-buttons">
                      <button onClick={() => handleSaveEdit(service.id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                    {Object.keys(formErrors).some(key => key.startsWith('edit')) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm font-semibold">Please fix the validation errors before saving</p>
                      </div>
                    )}
                </div>
              ) : (
                <>
                  <div className="service-header-row">
                    <h3>{service.name} ({service.currency})</h3>
                    {canEdit && (
                      <div className="service-actions">
                        <button onClick={() => handleStartEdit(service)}>Edit</button>
                        <button onClick={() => handleDeleteService(service.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                  <div className="service-details">
                    <div className="service-detail">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{service.type}</span>
                    </div>
                    
                    <div className="service-detail">
                      <span className="detail-label">Coverage:</span>
                      <span className="detail-value">{service.coverage}</span>
                    </div>
                    
                    <div className="service-detail">
                      <span className="detail-label">Transaction Limits:</span>
                      <span className="detail-value">
                        {service.transactionLimit ? `${service.currency} ${service.transactionLimit.min} - ${service.currency} ${service.transactionLimit.max}` : 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="service-detail">
                      <span className="detail-label">Turn Around Time:</span>
                      <span className="detail-value">{service.tat}</span>
                    </div>
                    
                    <div className="service-detail">
                      <span className="detail-label">Fee Structure:</span>
                      <span className="detail-value">
                        {service.feeStructure ? (
                          <>
                            {service.feeStructure.fixed > 0 && `${service.feeStructure.currency} ${service.feeStructure.fixed.toFixed(2)} fixed`}
                            {service.feeStructure.fixed > 0 && service.feeStructure.percentage > 0 && ' + '}
                            {service.feeStructure.percentage > 0 && `${service.feeStructure.percentage.toFixed(2)}%`}
                          </>
                        ) : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManager;
