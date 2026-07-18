import { create } from 'zustand'

export type ProfileSaveStatus = 'idle' | 'saving' | 'success' | 'error'

export interface ProfileStoreState {
  isSaving: boolean
  saveStatus: ProfileSaveStatus
  saveError: string | null
  avatarFile: File | null
  avatarPreview: string | null
  dirty: boolean
}

export interface ProfileStoreActions {
  setSaving: (saving: boolean) => void
  setSaveStatus: (status: ProfileSaveStatus) => void
  setSaveError: (error: string | null) => void
  setAvatarFile: (file: File | null) => void
  setAvatarPreview: (url: string | null) => void
  setDirty: (dirty: boolean) => void
  reset: () => void
}

const initialState: ProfileStoreState = {
  isSaving: false,
  saveStatus: 'idle',
  saveError: null,
  avatarFile: null,
  avatarPreview: null,
  dirty: false,
}

export const useProfileStore = create<ProfileStoreState & ProfileStoreActions>((set) => ({
  ...initialState,

  setSaving: (isSaving) => set({ isSaving }),

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  setSaveError: (saveError) => set({ saveError }),

  setAvatarFile: (avatarFile) => set({ avatarFile }),

  setAvatarPreview: (avatarPreview) => set({ avatarPreview }),

  setDirty: (dirty) => set({ dirty }),

  reset: () => set(initialState),
}))
