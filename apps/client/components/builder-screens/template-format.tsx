'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Slider } from '@repo/ui/components/slider';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import {
  ALargeSmall,
  Bold,
  Heading1,
  Heading2,
  LetterText,
  Maximize2,
  MoveVertical,
  Palette,
  RotateCcw,
  Type,
} from 'lucide-react';

import { FONT_OPTIONS } from '@/configs/font.config';
import { markResumeDirty } from '@/stores/features/resume.slice';
import {
  defaultFormat,
  type FontWeight,
  type Format,
  TEMPLATE_DEFAULT,
  templateFormatSelector,
  updateTemplateConfigFormat,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';

const COLOR_OPTIONS = [
  // Keeps the template's own accent color
  {
    value: TEMPLATE_DEFAULT,
    labelKey: 'Template default',
    color:
      'conic-gradient(#3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #3b82f6)',
  },
  { value: '#3b82f6', labelKey: 'Blue', color: '#3b82f6' },
  { value: '#06b6d4', labelKey: 'Cyan', color: '#06b6d4' },
  { value: '#14b8a6', labelKey: 'Teal', color: '#14b8a6' },
  { value: '#10b981', labelKey: 'Emerald', color: '#10b981' },
  { value: '#22c55e', labelKey: 'Green', color: '#22c55e' },
  { value: '#84cc16', labelKey: 'Lime', color: '#84cc16' },
  { value: '#eab308', labelKey: 'Yellow', color: '#eab308' },
  { value: '#f59e0b', labelKey: 'Amber', color: '#f59e0b' },
  { value: '#f97316', labelKey: 'Orange', color: '#f97316' },
  { value: '#ef4444', labelKey: 'Red', color: '#ef4444' },
  { value: '#f43f5e', labelKey: 'Rose', color: '#f43f5e' },
  { value: '#ec4899', labelKey: 'Pink', color: '#ec4899' },
  { value: '#d946ef', labelKey: 'Fuchsia', color: '#d946ef' },
  { value: '#8b5cf6', labelKey: 'Purple', color: '#8b5cf6' },
  { value: '#7c3aed', labelKey: 'Violet', color: '#7c3aed' },
  { value: '#6366f1', labelKey: 'Indigo', color: '#6366f1' },
  { value: '#1e3a8a', labelKey: 'Navy', color: '#1e3a8a' },
  { value: '#64748b', labelKey: 'Slate', color: '#64748b' },
  { value: '#1f2937', labelKey: 'Black', color: '#1f2937' },
];

const FONT_WEIGHT_OPTIONS: { value: FontWeight; labelKey: string }[] = [
  { value: 'normal', labelKey: 'Normal' },
  { value: 'medium', labelKey: 'Medium' },
  { value: 'semibold', labelKey: 'Semibold' },
  { value: 'bold', labelKey: 'Bold' },
];

interface FormatSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const FormatSlider = ({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
}: FormatSliderProps) => {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div
            className={`
              flex h-7 w-7 items-center justify-center rounded-md
              bg-linear-to-br from-purple-500 to-indigo-600 text-white
            `}
          >
            {icon}
          </div>
          <Label className='text-sm font-medium'>{label}</Label>
        </div>
        <span className='text-muted-foreground text-sm font-medium'>
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) =>
          values[0] !== undefined && onChange(values[0])
        }
        className='cursor-pointer'
      />
    </div>
  );
};

interface FormatSelectRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const FormatSelectRow = ({ icon, label, children }: FormatSelectRowProps) => {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div
          className={`
            flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br
            from-purple-500 to-indigo-600 text-white
          `}
        >
          {icon}
        </div>
        <Label className='text-sm font-medium'>{label}</Label>
      </div>
      {children}
    </div>
  );
};

const TemplateFormat = () => {
  const dispatch = useAppDispatch();
  const format = useAppSelector(templateFormatSelector);

  // The format is saved with the resume, so a change is unsaved work too
  const updateFormat = (updates: Partial<Format>) => {
    dispatch(updateTemplateConfigFormat(updates));
    dispatch(markResumeDirty());
  };

  const handleReset = () => {
    dispatch(updateTemplateConfigFormat(defaultFormat));
    dispatch(markResumeDirty());
  };

  return (
    <Card
      className={`
        sticky top-4 gap-0 bg-white/80 shadow-xl backdrop-blur-sm
        dark:bg-gray-900/80
      `}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <div
              className={`
                flex h-9 w-9 items-center justify-center rounded-lg
                bg-linear-to-br from-purple-500 to-indigo-600
              `}
            >
              <Type className='h-5 w-5 text-white' />
            </div>
            Settings
          </CardTitle>
          <Button size='sm' onClick={handleReset}>
            <RotateCcw className='h-4 w-4' />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className='px-4 pb-4'>
        <Accordion type='multiple' className='w-full'>
          {/* Typography Section */}
          <AccordionItem value='typography' className='border-b-0'>
            <AccordionTrigger
              className={`
                text-muted-foreground py-3 text-xs font-semibold tracking-wider
                uppercase
                hover:no-underline
              `}
            >
              {'Typography'}
            </AccordionTrigger>
            <AccordionContent className='space-y-4 pb-4'>
              <FormatSelectRow
                icon={<Type className='h-4 w-4' />}
                label={'Font Family'}
              >
                <Select
                  value={format.fontFamily}
                  onValueChange={(value: string) =>
                    updateFormat({ fontFamily: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={'Select font'} />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ fontFamily: option.fontFamily }}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormatSelectRow>

              <FormatSlider
                icon={<ALargeSmall className='h-4 w-4' />}
                label={'Font Size'}
                value={format.fontSize}
                min={7}
                max={14}
                step={0.5}
                unit='pt'
                onChange={(value) => updateFormat({ fontSize: value })}
              />

              <FormatSlider
                icon={<Heading1 className='h-4 w-4' />}
                label={'Title Size'}
                value={format.titleSize}
                min={16}
                max={40}
                step={0.5}
                unit='pt'
                onChange={(value) => updateFormat({ titleSize: value })}
              />

              <FormatSlider
                icon={<Heading2 className='h-4 w-4' />}
                label={'Section Title Size'}
                value={format.sectionTitleSize}
                min={8}
                max={20}
                step={0.5}
                unit='pt'
                onChange={(value) => updateFormat({ sectionTitleSize: value })}
              />

              <FormatSlider
                icon={<Heading2 className='h-4 w-4' />}
                label={'Subtitle Size'}
                value={format.subTitleSize}
                min={8}
                max={18}
                step={0.5}
                unit='pt'
                onChange={(value) => updateFormat({ subTitleSize: value })}
              />

              <FormatSlider
                icon={<MoveVertical className='h-4 w-4' />}
                label={'Line Height'}
                value={format.lineHeight}
                min={1.2}
                max={2.2}
                step={0.1}
                onChange={(value) => updateFormat({ lineHeight: value })}
              />

              <FormatSlider
                icon={<LetterText className='h-4 w-4' />}
                label={'Letter Spacing'}
                value={format.letterSpacing}
                min={-0.5}
                max={2}
                step={0.1}
                unit='pt'
                onChange={(value) => updateFormat({ letterSpacing: value })}
              />

              <FormatSelectRow
                icon={<Bold className='h-4 w-4' />}
                label={'Font Weight'}
              >
                <Select
                  value={format.fontWeight}
                  onValueChange={(value: FontWeight) =>
                    updateFormat({ fontWeight: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={'Select font weight'} />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.labelKey}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormatSelectRow>
            </AccordionContent>
          </AccordionItem>

          {/* Layout Section */}
          <AccordionItem value='layout' className='border-b-0'>
            <AccordionTrigger
              className={`
                text-muted-foreground py-3 text-xs font-semibold tracking-wider
                uppercase
                hover:no-underline
              `}
            >
              {'Layout'}
            </AccordionTrigger>
            <AccordionContent className='space-y-4 pb-4'>
              <FormatSlider
                icon={<Maximize2 className='h-4 w-4' />}
                label={'Section Spacing'}
                value={format.sectionSpacing}
                min={4}
                max={30}
                step={1}
                unit='pt'
                onChange={(value) => updateFormat({ sectionSpacing: value })}
              />

              <FormatSlider
                icon={<Maximize2 className='h-4 w-4' />}
                label={'Page Margin'}
                value={format.margin}
                min={5}
                max={30}
                step={1}
                unit='mm'
                onChange={(value) => updateFormat({ margin: value })}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Appearance Section */}
          <AccordionItem value='appearance' className='border-b-0'>
            <AccordionTrigger
              className={`
                text-muted-foreground py-3 text-xs font-semibold tracking-wider
                uppercase
                hover:no-underline
              `}
            >
              Appearance
            </AccordionTrigger>
            <AccordionContent className='space-y-4 pb-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`
                      flex h-7 w-7 items-center justify-center rounded-md
                      bg-linear-to-br from-purple-500 to-indigo-600 text-white
                    `}
                  >
                    <Palette className='h-4 w-4' />
                  </div>
                  <Label className='text-sm font-medium'>
                    {'Accent Color'}
                  </Label>
                </div>

                <ToggleGroup
                  type='single'
                  spacing={3}
                  aria-label='Accent color'
                  value={format.color}
                  // Always one color: clicking the current one keeps it
                  onValueChange={(value) =>
                    value && updateFormat({ color: value })
                  }
                  className='grid w-full grid-cols-4'
                >
                  {COLOR_OPTIONS.map((option) => (
                    <Tooltip key={option.value}>
                      {/* The span is the trigger: on the item itself, the
                          tooltip's data-state would replace its "on" state */}
                      <TooltipTrigger asChild>
                        <span className='flex'>
                          <ToggleGroupItem
                            value={option.value}
                            aria-label={option.labelKey}
                            className={`
                              hover:bg-muted
                              data-[state=on]:border-primary
                              data-[state=on]:bg-transparent
                              h-10 w-full cursor-pointer rounded-lg border-2
                              border-transparent
                            `}
                          >
                            <span
                              className='size-6 rounded-full shadow-sm'
                              style={{ background: option.color }}
                            />
                          </ToggleGroupItem>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{option.labelKey}</TooltipContent>
                    </Tooltip>
                  ))}
                </ToggleGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TemplateFormat;
