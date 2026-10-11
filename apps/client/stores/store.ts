'use client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';

import { StorageSliceName } from '@/constants/storage.constant';
import { resumeReducer } from '@/stores/features/resume.slice';
import { templateReducer } from '@/stores/features/template.slice';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem() {
      return Promise.resolve();
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== 'undefined' ? AsyncStorage : createNoopStorage();

const appReducer = combineReducers({
  [StorageSliceName.Resume]: resumeReducer,
  [StorageSliceName.Template]: templateReducer,
});

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action,
) => {
  if (action.type === 'root/reset') {
    state = undefined;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer<ReturnType<typeof appReducer>>(
  {
    key: 'root',
    storage,
    whitelist: [],
    transforms: [],
  },
  appReducer,
);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PAUSE',
            'persist/FLUSH',
            'persist/PURGE',
            'persist/REGISTER',
          ],
        },
      }),
  });
};

export const store = makeStore();
export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
