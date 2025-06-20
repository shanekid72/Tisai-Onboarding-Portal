// Reset Authentication Utility
// Run this in browser console to reset auth state

function resetCRMAuth() {
  console.log('🔄 Resetting CRM Authentication...');
  
  // Clear all localStorage items related to admin and CRM
  const keysToRemove = [
    'admin_auth_state',
    'admin_users',
    'crm_data_state'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  });
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  console.log('✅ Cleared session storage');
  
  // Reload the page
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.resetCRMAuth = resetCRMAuth;
  console.log('🛠️ Reset utility loaded. Run resetCRMAuth() to reset authentication.');
}

export default resetCRMAuth; 