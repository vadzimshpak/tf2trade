import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from "@/lib/interfaces/user";
import {Description, Inventory} from "@/lib/interfaces/inventory";

interface UserState {
  user: User | null;
  inventory: Inventory | null;
  loading: boolean;
  selectedItems: number;
  totalAmount: number;
  selectedNames: string[];
}

const initialState: UserState = {
  user: null,
  inventory: null,
  loading: false,
  selectedItems: 0,
  totalAmount: 0,
  selectedNames: [],
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserInventory: (state, action: PayloadAction<Inventory | null>) => {
      state.inventory = action.payload;
    },
    moveUserItemToSelected: (state, action: PayloadAction<Description>) => {
      if (!state.inventory)
        return;

      const desk = state.inventory.descriptions
        .find((desk) => desk.instanceid === action.payload.instanceid && desk.classid === action.payload.classid);

      if (!desk) return;

      desk.selected_assetids.push(desk.assetids.pop() || "?");
      state.selectedItems += 1;
      state.totalAmount += desk.price_usd;
    },
    moveUserItemToBody: (state, action: PayloadAction<Description>) => {
      if (!state.inventory)
        return;

      const desk = state.inventory.descriptions
        .find((desk) => desk.instanceid === action.payload.instanceid && desk.classid === action.payload.classid);


      if (!desk) return;

      desk.assetids.push(desk.selected_assetids.pop() || "?");
      state.selectedItems -= 1;
      state.totalAmount -= desk.price_usd;
    },
    updateTradelink(state, action: PayloadAction<string>) {
      if (!state.user)
        return;

      state.user.tradelink = action.payload;
    }
  },
})

export const {
  setUser,
  setUserInventory,
  moveUserItemToSelected,
  moveUserItemToBody,
  updateTradelink
} = userSlice.actions;
export default userSlice.reducer;
