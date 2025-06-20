# 🧪 Onboarding Flow Test Guide

## Overview
This guide will help you test the partner onboarding flow and verify that documents are properly syncing to the CRM system.

## 🚀 Quick Test Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test the Onboarding Flow

#### Step 1: Access Partner Onboarding
1. Navigate to `http://localhost:5173`
2. Go to the Partner Onboarding section
3. Fill out the partner information form:
   - **Name**: Test Partner
   - **Organization**: My Test Company
   - **Email**: test@mytestcompany.com
   - **Phone**: +1 (555) 123-4567
   - **Role**: CEO
   - **Country**: United States

#### Step 2: Complete NDA Stage
1. After submitting the form, you should see the chat interface
2. The AI agent will provide an NDA download link
3. Upload any PDF file as the signed NDA
4. **Expected Result**: 
   - Stage should automatically progress from "NDA" to "Commercial Terms"
   - You should see a completion message
   - Progress bar should update
   - Document should sync to CRM (check console logs)

#### Step 3: Verify Document Sync
1. Open browser developer tools (F12)
2. Check the console for these messages:
   ```
   ✅ Document successfully added to CRM system: [document name]
   📄 Document ID: unified-[timestamp]-[random]
   🔍 CRM Search Results by ID: [number]
   📄 NDA documents in CRM: [number]
   🎯 Our uploaded document found: YES
   ```

#### Step 4: Check CRM Integration
1. Navigate to the CRM section (if you have admin access)
2. Go to Documents page
3. Search for your test company name
4. **Expected Result**: You should see the uploaded NDA document

### 3. Test Commercial Terms Stage
1. In the commercial terms stage, click "Yes, I Agree"
2. **Expected Result**: 
   - Stage should progress to "KYC"
   - You should see KYC document upload interface

### 4. Test KYC Stage
1. Upload any document in the KYC stage
2. **Expected Result**: 
   - Document should sync to CRM
   - Stage should progress to "Agreement"

## 🔍 Debugging

### Console Logs to Look For

#### Successful Document Upload:
```
🔄 Uploading nda file: [filename]
📊 Current stage before upload: nda
🔄 Syncing to CRM with partner info: [partner object]
✅ Document successfully added to CRM system: [document name]
📄 Document ID: unified-[timestamp]-[random]
📊 Total documents in system: [number]
🔍 Document position in array: 0
✅ Document successfully added and verified in array
✅ Document synced to CRM: [document ID]
🎯 NDA uploaded, current stage: nda
🚀 Processing NDA approval and stage progression...
🔄 Updating approval status: nda Legal approved NDA document uploaded and received
📊 Stage progression initiated
🚀 Moving to next stage after approval...
🚀 Moving to next stage from: nda
📊 Current stage: Non-Disclosure Agreement
📊 Next stage: Commercial Terms
```

#### Successful Document Verification:
```
🔍 Starting document verification...
🔍 ID search results: 1
🔍 Name search results: 1
🔍 Total documents after addition: [number]
✅ Document verification: FOUND
📄 Verified document details: [object with id, name, type, status]
```

#### Successful Stage Progression:
```
🎉 Non-Disclosure Agreement Completed!
📨 Sending stage-specific message for: commercials
💰 Commercial Terms Discussion
🎉 Stage completed successfully!
✅ Moving to the next stage
```

### Common Issues and Solutions

#### Issue: Stage Not Progressing
**Symptoms**: Document uploads but stage stays the same
**Solution**: 
1. Check console for errors
2. Verify `updateApprovalStatus` is being called
3. Check that `moveToNextStage` is being triggered

#### Issue: Document Not Syncing to CRM
**Symptoms**: Upload succeeds but document not found in CRM
**Solution**:
1. Check console for CRM sync errors
2. Verify `unifiedDocumentService` is working
3. Check document service initialization

#### Issue: No Chat Messages
**Symptoms**: Form submits but no chat interface appears
**Solution**:
1. Check `initializeOnboarding` function
2. Verify partner info is being passed correctly
3. Check localStorage for saved state

## 🧪 Advanced Testing

### Test Different Document Types
1. Upload different file types (PDF, DOC, JPG)
2. Verify they all sync properly to CRM
3. Check that appropriate metadata is set

### Test Error Scenarios
1. Try uploading very large files
2. Test with invalid file types
3. Verify error handling works correctly

### Test State Persistence
1. Complete part of onboarding
2. Refresh the page
3. Verify state is restored from localStorage

### Test CRM Search
1. Upload multiple documents
2. Search for them in CRM by:
   - Company name
   - Document type
   - Upload date
   - Tags

## 📊 Expected Results Summary

### After Successful Test:
- ✅ Partner contact created in CRM
- ✅ NDA document uploaded and synced
- ✅ Stage progression working (NDA → Commercial → KYC → Agreement)
- ✅ Documents searchable in CRM
- ✅ Proper metadata and tags applied
- ✅ Approval workflows attached
- ✅ Notifications displayed

### Performance Expectations:
- Form submission: < 2 seconds
- Document upload: < 5 seconds
- Stage progression: < 1 second
- CRM sync: < 3 seconds

## 🐛 Troubleshooting

If tests fail, check:
1. **Network tab** for failed API calls
2. **Console** for JavaScript errors
3. **Application tab** for localStorage data
4. **Sources tab** for breakpoint debugging

## 📞 Support

If you encounter issues:
1. Check the console logs first
2. Verify all dependencies are installed (`npm install`)
3. Try clearing localStorage and starting fresh
4. Check that the development server is running properly

---

**Note**: This is a development/demo system. In production, you would have real API endpoints, database storage, and proper authentication.

### 3. Verify Documents in CRM

#### Step 1: Access the CRM System
1. Login as an admin user with CRM access:
   - **Username**: partnership.team
   - **Password**: partnership123
2. Navigate to the CRM section from the admin dashboard
3. Click on "Documents" in the CRM sidebar

#### Step 2: Verify Document Sync
1. The Documents page will show all documents in the system
2. Look for your uploaded NDA document:
   - It should appear with the partner's company name
   - Status should show based on approval stage
   - You can search by company name or document ID
3. The document count in the header should match the console logs

#### Step 3: Document Actions
Each document in the CRM has the following actions:
- **👁️ View**: Shows document details and metadata
- **⬇️ Download**: Downloads the document (simulated in demo)
- **🗑️ Delete**: Removes the document from the system
- **✅ Approve / ❌ Reject**: Available for pending documents

#### Step 4: Auto-refresh Feature
- The Documents page auto-refreshes every 5 seconds by default
- You can toggle this on/off with the "Auto-refresh" button
- Last refresh time is displayed next to the button

## 🔍 Troubleshooting

If tests fail, check:
1. **Network tab** for failed API calls
2. **Console** for JavaScript errors
3. **Application tab** for localStorage data
4. **Sources tab** for breakpoint debugging

## 📞 Support

If you encounter issues:
1. Check the console logs first
2. Verify all dependencies are installed (`npm install`)
3. Try clearing localStorage and starting fresh
4. Check that the development server is running properly

---

**Note**: This is a development/demo system. In production, you would have real API endpoints, database storage, and proper authentication. 