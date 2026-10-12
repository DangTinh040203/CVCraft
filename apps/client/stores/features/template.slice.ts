import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { StorageSliceName } from '@/constants/storage.constant';
import { type RootState } from '@/stores/store';

export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type ColumnLayout = 'single' | 'double';
export type HeaderStyle = 'left' | 'center';
export type Theme = 'light' | 'dark' | 'auto';
export type BorderStyle = 'none' | 'simple' | 'double' | 'accent';
export type SectionType =
  | 'personal'
  | 'summary'
  | 'skills'
  | 'education'
  | 'experience'
  | 'projects'
  | 'certifications'
  | 'languages';

/** Sentinel for "keep the template's own font/color". */
export const TEMPLATE_DEFAULT = 'default';

/**
 * Sizes are print units: font sizes, letter and section spacing in pt, the
 * page margin in mm. Formats saved before `sizeUnit` existed hold px (see
 * `normalizeFormat`).
 */
export interface Format {
  sizeUnit?: 'pt';

  // Typography
  fontSize: number;
  fontFamily: string;
  titleSize: number;
  sectionTitleSize: number;
  subTitleSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;

  // Layout
  sectionSpacing: number;
  margin: number;
  pageFormat: 'A4';
  columnLayout: ColumnLayout;
  sectionOrder: SectionType[];
  hiddenSections: SectionType[];
  headerStyle: HeaderStyle;

  // Appearance
  color: string;
  theme: Theme;
  borderStyle: BorderStyle;
  dateFormat: string;
}

export interface TemplateConfig {
  format: Format;
  previewMode: boolean;
}

export interface TemplateState {
  templateConfig: TemplateConfig;
  templateSelected: string | null;
}

export const defaultSectionOrder: SectionType[] = [
  'personal',
  'summary',
  'skills',
  'education',
  'certifications',
  'languages',
  'experience',
  'projects',
];

// Matches the templates' own sizes, so an untouched slider shows the real value
export const defaultFormat: Format = {
  sizeUnit: 'pt',

  // Typography
  fontSize: 9.5,
  fontFamily: TEMPLATE_DEFAULT,
  titleSize: 24,
  sectionTitleSize: 11,
  subTitleSize: 10.5,
  lineHeight: 1.6,
  fontWeight: 'normal',
  letterSpacing: 0,

  // Layout
  sectionSpacing: 15,
  margin: 10,
  pageFormat: 'A4',
  columnLayout: 'single',
  sectionOrder: defaultSectionOrder,
  hiddenSections: [],
  headerStyle: 'left',

  // Appearance
  color: TEMPLATE_DEFAULT,
  theme: 'light',
  borderStyle: 'none',
  dateFormat: 'MM/YYYY',
};

const PX_TO_PT = 0.75;
const PX_TO_MM = 25.4 / 96;

// The px-era defaults: a saved value equal to one meant "untouched"
const LEGACY_PX_DEFAULTS = {
  fontSize: 11,
  titleSize: 30,
  sectionTitleSize: 14,
  subTitleSize: 14,
  lineHeight: 1.8,
  letterSpacing: 0,
  sectionSpacing: 10,
  margin: 20,
} as const;

const round = (value: number, step: number) =>
  Math.round(value / step) * step;

/**
 * Fills a saved format with defaults and converts one saved in px to pt/mm:
 * untouched values become today's defaults, changed ones keep their size.
 */
export function normalizeFormat(saved: Partial<Format> | null | undefined) {
  const format: Format = { ...defaultFormat, ...saved };
  if (!saved || saved.sizeUnit === 'pt') return format;

  for (const [key, legacyDefault] of Object.entries(LEGACY_PX_DEFAULTS)) {
    const name = key as keyof typeof LEGACY_PX_DEFAULTS;
    const value = saved[name];
    if (value === undefined || value === legacyDefault) {
      format[name] = defaultFormat[name];
    } else if (name === 'margin') {
      format.margin = round(value * PX_TO_MM, 1);
    } else if (name !== 'lineHeight') {
      format[name] = round(value * PX_TO_PT, 0.5);
    }
  }
  format.sizeUnit = 'pt';
  return format;
}

const initialState: TemplateState = {
  templateConfig: {
    format: defaultFormat,
    previewMode: false,
  },
  templateSelected: null,
};

const templateSlice = createSlice({
  name: StorageSliceName.Template,
  initialState,
  reducers: {
    updatePreviewMode: (state, action: PayloadAction<boolean>) => {
      state.templateConfig.previewMode = action.payload;
    },
    updateTemplateConfigFormat: (
      state,
      action: PayloadAction<Partial<Format>>,
    ) => {
      state.templateConfig.format = {
        ...state.templateConfig.format,
        ...action.payload,
      };
    },
    setTemplateSelected: (state, action: PayloadAction<string | null>) => {
      state.templateSelected = action.payload;
    },
  },
});

export const templateConfigSelector = (state: RootState) =>
  state.template.templateConfig;
export const templateFormatSelector = (state: RootState) =>
  state.template.templateConfig.format;
export const templateSelectedSelector = (state: RootState) =>
  state.template.templateSelected;

export const {
  updateTemplateConfigFormat,
  setTemplateSelected,
  updatePreviewMode,
} = templateSlice.actions;

export const templateReducer = templateSlice.reducer;
