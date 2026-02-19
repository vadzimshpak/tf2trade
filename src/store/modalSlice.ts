import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface ModalState {
  profileModalOpen: boolean;
}

const initialState: ModalState = {
  profileModalOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setProfileModalState: (state, action: PayloadAction<boolean>) => {
      state.profileModalOpen = action.payload;
    }
  }
})

export const { setProfileModalState } = modalSlice.actions;
export default modalSlice.reducer;