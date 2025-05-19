import React from 'react';
import PaymentForm from '../../../PaymentForm';
import SectionTitleRed from '../../../SectionTitleRed';
import type { FullClientData } from '../../../../types/client';

interface PaymentSectionProps {
  initialData?: FullClientData;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ initialData }) => {
  return (
    <div className="space-y-6">
      <SectionTitleRed>Règlement</SectionTitleRed>
      <PaymentForm 
        formData={initialData} 
        prefix="payment" 
        clientId={initialData?.client.id}
      />
    </div>
  );
};

export default PaymentSection;