'use client';

import { useUser } from '@clerk/nextjs';
import { toast } from '@repo/ui/components/sonner';
import { cn } from '@repo/ui/lib/utils';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import EducationForm from '@/components/builder-screens/forms/education-form';
import ExperienceForm from '@/components/builder-screens/forms/experience-form';
import ExtraForm from '@/components/builder-screens/forms/extra-form';
import PersonalForm from '@/components/builder-screens/forms/personal-form';
import ProjectsForm from '@/components/builder-screens/forms/projects-form';
import SkillsForm from '@/components/builder-screens/forms/skills-form';
import SummaryForm from '@/components/builder-screens/forms/summary-form';
import ResumeBuilderSidebar from '@/components/builder-screens/resume-builder-sidebar';
import ResumeControl from '@/components/builder-screens/resume-control';
import TemplateFormat from '@/components/builder-screens/template-format';
import TemplatePreview from '@/components/builder-screens/template-preview';
import NotFound from '@/components/common/not-found';
import { getTemplateBySlug, TEMPLATES } from '@/components/templates/registry';
import { Section } from '@/constants/builder-section.constant';
import { useGlobalSaveShortcut } from '@/hooks/use-global-save-shortcut';
import { useService } from '@/hooks/use-http';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';
import { ResumeService } from '@/services/resume.service';
import { setResume } from '@/stores/features/resume.slice';
import {
  normalizeFormat,
  setTemplateSelected,
  templateConfigSelector,
  templateSelectedSelector,
  updatePreviewMode,
  updateTemplateConfigFormat,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type ErrorResponse } from '@/types/error.response';
import { toastErrorMessage } from '@/utils/toast-error-message.util';

const sectionOrder = [
  Section.Personal,
  Section.Summary,
  Section.Skills,
  Section.Education,
  Section.Experience,
  Section.Projects,
  Section.Extra,
];

const BuilderScreenContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get('step') as Section;
  const templateSlug = searchParams.get('template');

  const [activeSection, setActiveSection] = useState<Section>(
    Object.values(Section).includes(currentStep)
      ? currentStep
      : Section.Personal,
  );

  const { resume } = useSyncResume();
  // Ctrl+S / Cmd+S saves from anywhere in the builder
  useGlobalSaveShortcut();
  useUnsavedChangesWarning();

  const { previewMode } = useAppSelector(templateConfigSelector);
  const templateSelected = useAppSelector(templateSelectedSelector);

  const { isLoaded, user } = useUser();
  const resumeService = useService(ResumeService);
  const dispatch = useAppDispatch();

  const [isFetching, setIsFetching] = useState(true);

  // The template comes from ?template=<slug>; without one, fall back to the
  // template saved on the resume.
  useEffect(() => {
    const fromUrl = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
    if (fromUrl) {
      dispatch(setTemplateSelected(fromUrl.key));
      return;
    }
    if (isFetching) return;

    const saved = TEMPLATES.find((t) => t.key === resume?.templateKey);
    if (saved) {
      dispatch(setTemplateSelected(saved.key));
    } else {
      toast.warning('Please select a template first', {
        id: 'no-template-selected',
      });
      router.push('/templates');
    }
  }, [dispatch, isFetching, resume?.templateKey, router, templateSlug]);

  useEffect(() => {
    if (!isLoaded) return; // Wait until Clerk auth is fully loaded

    const fetchResume = async () => {
      if (user && !resume) {
        try {
          const resumeRes = await resumeService.getResume();
          if (resumeRes) {
            dispatch(setResume(resumeRes));
            if (resumeRes.format) {
              dispatch(
                updateTemplateConfigFormat(normalizeFormat(resumeRes.format)),
              );
            }
          }
        } catch (e) {
          // e.g. a new account the backend hasn't set up yet (404)
          const error =
            e instanceof AxiosError
              ? (e.response?.data as ErrorResponse | undefined)
              : undefined;
          toastErrorMessage(
            error?.message ?? 'Could not load your resume. Please refresh.',
          );
        } finally {
          setIsFetching(false);
        }
      } else {
        setIsFetching(false);
      }
    };
    void fetchResume();
  }, [dispatch, resume, resumeService, user, isLoaded]);

  useEffect(() => {
    const step = searchParams.get('step') as Section;
    const targetSection =
      step && Object.values(Section).includes(step) ? step : Section.Personal;

    if (targetSection !== activeSection) {
      setActiveSection(targetSection);
    }
  }, [searchParams, activeSection]);

  const handleSectionChange = (section: Section) => {
    if (previewMode) {
      dispatch(updatePreviewMode(false));
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', section);
    router.push(`/builder?${params.toString()}`, { scroll: false });
  };

  const handleNext = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const nextSection = sectionOrder[currentIndex + 1];
    if (currentIndex < sectionOrder.length - 1 && nextSection) {
      handleSectionChange(nextSection);
    }
  };

  const handleBack = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const prevSection = sectionOrder[currentIndex - 1];
    if (currentIndex > 0 && prevSection) {
      handleSectionChange(prevSection);
    }
  };

  if (!templateSelected && !isFetching && !templateSlug) {
    return <NotFound />;
  }

  return (
    <main className='container mx-auto px-4 pt-20 pb-20'>
      <ResumeControl />

      <div
        className={`
          grid grid-cols-1 gap-6
          lg:grid-cols-12
        `}
      >
        <div
          className={`
            col-span-1
            lg:col-span-2
          `}
        >
          <ResumeBuilderSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        <div
          className={`
            col-span-1
            lg:col-span-7
          `}
        >
          {isFetching ? (
            <div className='flex h-[400px] w-full items-center justify-center'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
            </div>
          ) : (
            <AnimatePresence mode='wait'>
              {!previewMode ? (
                <motion.div
                  key='forms'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSection === Section.Personal && (
                    <PersonalForm onNext={handleNext} />
                  )}
                  {activeSection === Section.Summary && (
                    <SummaryForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Skills && (
                    <SkillsForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Education && (
                    <EducationForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Experience && (
                    <ExperienceForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Projects && (
                    <ProjectsForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Extra && (
                    <ExtraForm onBack={handleBack} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key='preview-main'
                  layoutId='template-preview-container'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <TemplatePreview />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div
          className={cn(`
            col-span-1
            lg:col-span-3
          `)}
        >
          <AnimatePresence mode='wait'>
            {!previewMode ? (
              <motion.div
                key='preview-sidebar'
                layoutId='template-preview-container'
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <TemplatePreview />
              </motion.div>
            ) : (
              <motion.div
                key='template-format'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TemplateFormat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default BuilderScreenContainer;
