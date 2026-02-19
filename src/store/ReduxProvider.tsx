'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import {ReactNode} from "react"; // your store configuration

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}