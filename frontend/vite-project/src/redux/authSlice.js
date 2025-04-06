import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://email-marketingbackend01.vercel.app/api/auth";

export const loginUser = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem("token") || null, error: null, loading: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
