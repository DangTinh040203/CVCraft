import { createSlice } from '@reduxjs/toolkit';

import { StorageSliceName } from '@/constants/storage.constant';

const initialState = {};

const templateSlice = createSlice({
  name: StorageSliceName.Template,
  initialState,
  reducers: {},
});

export const templateReducer = templateSlice.reducer;
