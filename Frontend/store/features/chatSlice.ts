import { createSlice } from "@reduxjs/toolkit";
import { User } from '@/lib/interface'

interface ChatState {
  currentChat: null | User,
}

const initialState: ChatState = {
  currentChat: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    updateCurrentChat: (state, action) => {
      // update the chat state object with the object clicked
      state.currentChat = action.payload;
    },
  },
});

export const { updateCurrentChat } = chatSlice.actions;

export default chatSlice.reducer;
