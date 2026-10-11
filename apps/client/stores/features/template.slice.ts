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

export interface Format {
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

export const defaultFormat: Format = {
  // Typography
  fontSize: 11,
  fontFamily: TEMPLATE_DEFAULT,
  titleSize: 30,
  sectionTitleSize: 14,
  subTitleSize: 14,
  lineHeight: 1.8,
  fontWeight: 'normal',
  letterSpacing: 0,

  // Layout
  sectionSpacing: 10,
  margin: 20,
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
