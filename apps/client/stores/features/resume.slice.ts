import { createSlice } from '@reduxjs/toolkit';

import { StorageSliceName } from '@/constants/storage.constant';
import { type Resume } from '@/types/resume.type';

export interface ResumeState {
  resume: Resume | null;
  /** The editor holds changes the backend doesn't have yet. */
  isDirty: boolean;
}

const initialState: ResumeState = {
  resume: null,
  isDirty: false,
};

const resumeSlice = createSlice({
  name: StorageSliceName.Resume,
  initialState,
  reducers: {
    /** The resume as the backend has it (loaded or just saved). */
    setResume: (state, action: { payload: Resume | null }) => {
      state.resume = action.payload;
      state.isDirty = false;
    },
    /** A resume read from an uploaded CV: shown, but not saved yet. */
    importResume: (state, action: { payload: Resume }) => {
      state.resume = action.payload;
      state.isDirty = true;
    },
    updateResume: (
      state,
      action: { payload: Partial<Omit<Resume, '_id'>> },
    ) => {
      if (state.resume) {
        state.resume = { ...state.resume, ...action.payload };
        state.isDirty = true;
      }
    },
    /** For unsaved edits kept outside this slice (the Customize format). */
    markResumeDirty: (state) => {
      if (state.resume) state.isDirty = true;
    },
  },
});

export const { setResume, importResume, updateResume, markResumeDirty } =
  resumeSlice.actions;
export const resumeSelector = (state: { resume: ResumeState }) => state.resume;
export const resumeReducer = resumeSlice.reducer;
