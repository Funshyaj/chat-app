import { User } from "@/lib/interface";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  user: User | null
}

const initialState: UserState = {
  user: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      // update the user state object with the object from the backend
      state.user = action.payload;
    },
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;
