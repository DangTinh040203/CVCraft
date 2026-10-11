import { createSlice } from '@reduxjs/toolkit';

import { StorageSliceName } from '@/constants/storage.constant';
import { type Resume } from '@/types/resume.type';

export interface ResumeState {
  resume: Resume | null;
}

const initialState: ResumeState = {
  resume: null,
};

const resumeSlice = createSlice({
  name: StorageSliceName.Resume,
  initialState,
  reducers: {
    setResume: (state, action: { payload: Resume | null }) => {
      state.resume = action.payload;
    },
    updateResume: (
      state,
      action: { payload: Partial<Omit<Resume, '_id'>> },
    ) => {
      if (state.resume) {
        state.resume = { ...state.resume, ...action.payload };
      }
    },
  },
});

export const { setResume, updateResume } = resumeSlice.actions;
export const resumeSelector = (state: { resume: ResumeState }) => state.resume;
export const resumeReducer = resumeSlice.reducer;
