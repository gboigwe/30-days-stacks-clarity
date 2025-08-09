// Token transfer interface
'use client';

import { useState } from 'react';
import { useTokenTransfers } from '@/hooks/useTokenTransfers';
import { tokenValidation, tokenFormatting } from '@/lib/token-utils';
import { ArrowRight, User, Hash, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface TokenTransferFormProps {
  userBalance: number;
  onTransferComplete: () => void;
}

export default function TokenTransferForm({ userBalance, onTransferComplete }: TokenTransferFormProps) {
  const { transferTokens, transferState, error } = useTokenTransfers();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    memo: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate recipient address
    if (!formData.recipient.trim()) {
      errors.recipient = 'Recipient address is required';
    } else if (!tokenValidation.isValidStacksAddress(formData.recipient)) {
      errors.recipient = 'Invalid Stacks address format';
    }

    // Validate amount
    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amountValidation = tokenValidation.isValidTransferAmount(formData.amount, userBalance);
      if (!amountValidation.valid) {
        errors.amount = amountValidation.error!;
      }
    }

    // Validate memo
    if (formData.memo && !tokenValidation.isValidMemo(formData.memo)) {
      errors.memo = 'Memo must be 34 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await transferTokens(
        formData.recipient,
        parseFloat(formData.amount),
        formData.memo || undefined
      );

      if (result.success) {
        // Reset form
        setFormData({ recipient: '', amount: '', memo: '' });
        setFormErrors({});
        onTransferComplete();
      }
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isSubmitting = transferState === 'signing' || transferState === 'pending';
  const maxAmount = userBalance / 1000000; // Convert to AOD

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transfer Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Available Balance:</span>
          <span className="font-semibold text-gray-900">
            {tokenFormatting.formatAmount(userBalance, 'display')}
          </span>
        </div>
      </div>

      {/* Recipient Address */}
      <div>
        <label htmlFor="recipient" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <User className="h-4 w-4 mr-1" />
          Recipient Address *
        </label>
        <input
          type="text"
          id="recipient"
          value={formData.recipient}
          onChange={(e) => handleInputChange('recipient', e.target.value)}
          placeholder="ST1ABC123DEFG456HIJK789LMNOP012QRST345UVW"
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-ageofdevs-primary focus:border-transparent font-mono text-sm ${
            formErrors.recipient ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.recipient && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.recipient}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter a valid Stacks address (starts with ST or SM)
        </p>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Hash className="h-4 w-4 mr-1" />
          Amount (AOD) *
        </label>
        <div className="relative">
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            max={maxAmount}
            className={`w-full p-3 pr-16 border rounded-md focus:ring-2 focus:ring-ageofdevs-primary focus:border-transparent ${
              formErrors.amount ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
            AOD
          </span>
        </div>
        {formErrors.amount && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.amount}
          </div>
        )}
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Minimum: 0.000001 AOD</span>
          <button
            type="button"
            onClick={() => handleInputChange('amount', maxAmount.toString())}
            className="text-ageofdevs-primary hover:text-ageofdevs-secondary font-medium"
          >
            Use Max ({maxAmount.toFixed(6)} AOD)
          </button>
        </div>
      </div>

      {/* Memo (Optional) */}
      <div>
        <label htmlFor="memo" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 mr-1" />
          Memo (Optional)
        </label>
        <input
          type="text"
          id="memo"
          value={formData.memo}
          onChange={(e) => handleInputChange('memo', e.target.value)}
          placeholder="Optional message (34 characters max)"
          maxLength={34}
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-ageofdevs-primary focus:border-transparent ${
            formErrors.memo ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.memo && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.memo}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.memo.length}/34 characters
        </p>
      </div>

      {/* Transfer Preview */}
      {formData.recipient && formData.amount && !formErrors.recipient && !formErrors.amount && (
        <div className="bg-ageofdevs-primary/10 border border-ageofdevs-primary/20 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Transfer Preview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-mono text-gray-900">
                {tokenFormatting.formatAddress(formData.recipient)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">
                {formData.amount} AOD
              </span>
            </div>
            {formData.memo && (
              <div className="flex justify-between">
                <span className="text-gray-600">Memo:</span>
                <span className="text-gray-900">"{formData.memo}"</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-800">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || Object.keys(formErrors).length > 0}
        className="w-full bg-ageofdevs-primary hover:bg-ageofdevs-secondary text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-ageofdevs-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {transferState === 'idle' && (
          <>
            <ArrowRight className="inline h-5 w-5 mr-2" />
            Send Tokens
          </>
        )}
        {transferState === 'signing' && (
          <>
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Check Your Wallet...
          </>
        )}
        {transferState === 'pending' && (
          <>
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Confirming Transfer...
          </>
        )}
        {transferState === 'completed' && (
          <>
            <CheckCircle className="inline h-5 w-5 mr-2" />
            Transfer Successful!
          </>
        )}
        {transferState === 'failed' && (
          <>
            <AlertCircle className="inline h-5 w-5 mr-2" />
            Try Again
          </>
        )}
      </button>

      {/* Fee Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>Network fees are paid in STX and depend on network congestion.</p>
      </div>
    </form>
  );
}