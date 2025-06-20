import React, { useState } from 'react';
import { usePartnerOnboarding } from '../../context/PartnerOnboardingContext';
import { OnboardingStage } from '../../types/partnerOnboarding';

const AdminPanel: React.FC = () => {
  const { 
    state, 
    updateApprovalStatus, 
    moveToNextStage, 
    markDocumentReceived,
    resetOnboarding 
  } = usePartnerOnboarding();
  
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  if (!state) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Admin Panel</h3>
        <p className="text-gray-400">No active onboarding session</p>
      </div>
    );
  }

  const handleApproval = (stageId: OnboardingStage, team: string, approved: boolean) => {
    const reason = approved ? undefined : rejectionReason;
    updateApprovalStatus(stageId, team, approved ? 'approved' : 'rejected', reason);
    setRejectionReason('');
  };

  const handleDocumentReceived = (documentId: string) => {
    const fileName = prompt('Enter the received document filename:');
    if (fileName) {
      markDocumentReceived(documentId, fileName);
    }
  };

  const handleMoveToNextStage = () => {
    if (confirm('Are you sure you want to move to the next stage?')) {
      moveToNextStage();
    }
  };

  const handleResetOnboarding = () => {
    if (confirm('Are you sure you want to reset the entire onboarding process? This cannot be undone.')) {
      resetOnboarding();
    }
  };

  const currentStageConfig = state.stages.find(s => s.id === state.currentStage);
  const pendingApprovals = state.stages.flatMap(stage => 
    stage.approvals
      .filter(approval => approval.status === 'pending')
      .map(approval => ({ ...approval, stageId: stage.id, stageTitle: stage.title }))
  );

  return (
    <div className="p-6 bg-gray-800 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Admin Panel</h3>
        <button
          onClick={handleResetOnboarding}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
        >
          Reset Onboarding
        </button>
      </div>

      {/* Partner Info */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Partner Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {state.partnerInfo.name}</div>
          <div><strong>Organization:</strong> {state.partnerInfo.organization}</div>
          <div><strong>Email:</strong> {state.partnerInfo.email}</div>
          <div><strong>Current Stage:</strong> {currentStageConfig?.title}</div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-yellow-400">Pending Approvals</h4>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div key={`${approval.stageId}-${approval.team}`} className="flex items-center justify-between bg-gray-700/50 rounded p-3">
                <div>
                  <div className="font-medium">{approval.stageTitle}</div>
                  <div className="text-sm text-gray-400">Team: {approval.team}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval(approval.stageId as OnboardingStage, approval.team, true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        setRejectionReason(reason);
                        handleApproval(approval.stageId as OnboardingStage, approval.team, false);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KYC Documents */}
      {state.currentStage === 'kyc' && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-blue-400">KYC Documents</h4>
          <div className="space-y-2">
            {state.stages.find(s => s.id === 'kyc')?.requirements?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                <div>
                  <div className="text-sm font-medium">{doc.label}</div>
                  <div className="text-xs text-gray-400">Status: {doc.status}</div>
                  {doc.fileName && (
                    <div className="text-xs text-blue-400">File: {doc.fileName}</div>
                  )}
                </div>
                {doc.status === 'pending' && (
                  <button
                    onClick={() => handleDocumentReceived(doc.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Mark as Received
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Management */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Stage Management</h4>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Current Stage: <strong>{currentStageConfig?.title}</strong></div>
            <div className="text-xs text-gray-400">
              Progress: {Math.round((state.stages.filter(s => s.completed).length / state.stages.length) * 100)}%
            </div>
          </div>
          <button
            onClick={handleMoveToNextStage}
            disabled={!currentStageConfig?.completed}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
          >
            Move to Next Stage
          </button>
        </div>
      </div>

      {/* All Stages Overview */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium mb-3">All Stages</h4>
        <div className="space-y-2">
          {state.stages.map((stage) => (
            <div key={stage.id} className={`p-2 rounded ${
              stage.id === state.currentStage ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-gray-600/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{stage.title}</div>
                  <div className="text-xs text-gray-400">
                    Status: {stage.completed ? 'Completed' : stage.id === state.currentStage ? 'Active' : 'Pending'}
                  </div>
                </div>
                <div className="text-xs">
                  {stage.approvals.map((approval) => (
                    <div key={approval.team} className={`inline-block px-2 py-1 rounded mr-1 ${
                      approval.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                      approval.status === 'rejected' ? 'bg-red-600/20 text-red-400' :
                      approval.status === 'not-required' ? 'bg-gray-600/20 text-gray-400' :
                      'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {approval.team}: {approval.status}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 