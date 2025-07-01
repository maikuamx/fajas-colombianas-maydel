'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, act } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface CartItem{
    id: string;
    product_id: string;
    color_id?: string;
    quantity: number;
    price_at_add: number;
    product: {
        id: string;
        name: string;
        image_url: string;
        prince: number;
    };
    color?:{
        id: string;
        color_name: string;
        color_code: string;
    }
}

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
    isLoading: boolean;
}

type CartAction = 
 | { type: 'SET_LOADING'; payload: boolean }
 | { type: 'SET_ITEMS'; payload: CartItem[] }
 | { type: 'ADD_ITEM'; payload: CartItem }
 | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
 | { type: 'REMOVE_ITEM'; payload: string}
 | { type: 'CLEAR_CART'}

const initialState: CartState = {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return {...state, isLoading: action.payload};
        
        case 'SET_ITEMS':
            const items = action.payload;
            return{
                ...state,
                items,
                total: items.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
                itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            };
        
        case 'ADD_ITEM':
            const newItems = [...state.items, action.payload];
            return{
                ...state,
                items: newItems,
                total: newItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
                itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };

        case 'UPDATE_ITEM':
            const updatedItems = state.items.map(item =>
                item.id === action.payload.id
                ? { ...item, quantity: action.payload.quantity}
                : item
            );

            return{
                ...state,
                items: updatedItems,
                total: updatedItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
                itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            };

        case 'REMOVE_ITEM':
            const filteredItems = state.items.filter(item => item.id !== action.payload);
            return{
                ...state,
                items: filteredItems,
                total: filteredItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
                itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
            };

        case 'CLEAR_CART':
            return initialState;
        
        default:
            return state;
    }
}



 