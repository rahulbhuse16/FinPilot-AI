import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "../types/domain";

interface CustomerState {
  selectedCustomer: Customer | null;
}

const initialState: CustomerState = {
  selectedCustomer: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setSelectedCustomer(state, action: PayloadAction<Customer | null>) {
      state.selectedCustomer = action.payload;
    },
  },
});

export const { setSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
