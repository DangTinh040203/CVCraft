'use client';

import { motion } from 'framer-motion';
import React from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import CertificationForm from '@/components/builder-screens/forms/certification-form';
import LanguageForm from '@/components/builder-screens/forms/language-form';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updatePreviewMode } from '@/stores/features/template.slice';
import { useAppDispatch } from '@/stores/store';

interface ExtraFormProps {
  onBack?: () => void;
}

const ExtraForm = ({ onBack }: ExtraFormProps) => {
  const { sync, isSyncing } = useSyncResume();
  const dispatch = useAppDispatch();

  const onSubmit = async () => {
    const success = await sync();
    if (success) {
      dispatch(updatePreviewMode(true));
    }
  };

  return (
    <div className='space-y-8'>
      <CertificationForm hideNavigation />
      <LanguageForm hideNavigation />

      {/* Main Navigation for the Extra Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <BuilderNavigation
          onBack={onBack}
          onNext={onSubmit}
          disableBack={!onBack}
          loading={isSyncing}
          nextLabel={'Finish'}
        />
      </motion.div>
    </div>
  );
};

export default ExtraForm;
