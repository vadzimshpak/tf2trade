import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SteamUser} from "@/lib/interfaces/steamUser";
import {Description, Inventory} from "@/lib/interfaces/inventory";

interface BotState {
  bots: SteamUser[];
  inventory: Inventory | null;
  selectedItems: 0;
  totalAmount: number;
}

const initialState: BotState = {
  bots: [],
  inventory: null,
  selectedItems: 0,
  totalAmount: 0
};

const botSlice = createSlice({
  name: "bot",
  initialState,
  reducers: {
    setBotInventory: (state, action: PayloadAction<Inventory | null>) => {
      state.inventory = action.payload;
    },
    moveBotItemToSelected: (state, action: PayloadAction<Description>) => {
      if (!state.inventory)
        return;

      const desk = state.inventory.descriptions
        .find((desk) => desk.instanceid === action.payload.instanceid && desk.classid === action.payload.classid);

      if (!desk) return;
      desk.selected_assetids.push(desk.assetids.pop() || "?")
      state.selectedItems += 1;
      state.totalAmount += desk.price_usd;
    },
    moveBotItemToBody: (state, action: PayloadAction<Description>) => {
      if (!state.inventory)
        return;

      const desk = state.inventory.descriptions
        .find((desk) => desk.instanceid === action.payload.instanceid && desk.classid === action.payload.classid);

      if (!desk) return;
      desk.assetids.push(desk.selected_assetids.pop() || "?");
      state.selectedItems -= 1;
      state.totalAmount -= desk.price_usd;
    },
  },
})

export const {
  setBotInventory,
  moveBotItemToSelected,
  moveBotItemToBody,
} = botSlice.actions;
export default botSlice.reducer;