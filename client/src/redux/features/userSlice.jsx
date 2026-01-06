import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        isDoctor: false,
        isAdmin: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.isDoctor = action.payload.isDoctor || false;
            state.isAdmin = action.payload.isAdmin || false;
        },
        clearUser: (state) => {
            state.user = null;
            state.isDoctor = false;
            state.isAdmin = false;
        },
        updateUserRole: (state, action) => {
            state.isDoctor = action.payload.isDoctor || false;
            state.isAdmin = action.payload.isAdmin || false;
        }
    },
});

export const { setUser, clearUser, updateUserRole } = userSlice.actions;
export default userSlice.reducer;