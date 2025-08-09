'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import type { User } from '@supabase/auth-helpers-nextjs';

interface CartItem {
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
  color?: {
    id: string;
    color_name: string;
    color_code: string;
  };
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
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ITEMS':
      const items = action.payload;
      return {
        ...state,
        items,
        total: items.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
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

interface CartContextType extends CartState {
  addToCart: (productId: string, colorId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export function CartProvider({ children, initialUser }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const supabase = createClientComponentClient();

  // Generate session ID for anonymous users
  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Get or create cart
  const getCart = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      
      let cart;
      if (user) {
        // Authenticated user
        const { data } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!data) {
          const { data: newCart, error } = await supabase
            .from('carts')
            .insert([{ user_id: user.id }])
            .select()
            .single();
          
          if (error) throw error;
          cart = newCart;
        } else {
          cart = data;
        }
      } else {
        // Anonymous user
        const sessionId = getSessionId();
        if (!sessionId) return null;
        
        const { data } = await supabase
          .from('carts')
          .select('*')
          .eq('session_id', sessionId)
          .single();
        
        if (!data) {
          const { data: newCart, error } = await supabase
            .from('carts')
            .insert([{ session_id: sessionId }])
            .select()
            .single();
          
          if (error) throw error;
          cart = newCart;
        } else {
          cart = data;
        }
      }
      
      return cart;
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  };

  // Load cart items
  const loadCartItems = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await getCart();
      
      if (!cart) {
        dispatch({ type: 'SET_ITEMS', payload: [] });
        return;
      }

      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          color:product_colors(*)
        `)
        .eq('cart_id', cart.id);

      if (error) throw error;

      dispatch({ type: 'SET_ITEMS', payload: items || [] });
    } catch (error) {
      console.error('Error loading cart items:', error);
      dispatch({ type: 'SET_ITEMS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, colorId?: string, quantity: number = 1) => {
    try {
      console.log('Starting addToCart:', { productId, colorId, quantity });
      
      const cart = await getCart();
      if (!cart) {
        throw new Error('No se pudo crear el carrito');
      }

      console.log('Cart found:', cart);

      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        console.error('Product error:', productError);
        throw new Error('Producto no encontrado');
      }

      console.log('Product found:', product);

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .eq('color_id', colorId || null)
        .single();

      console.log('Existing item:', existingItem);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select(`
            *,
            product:products(*),
            color:product_colors(*)
          `)
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        console.log('Item updated:', updatedItem);

        if (updatedItem) {
          dispatch({ type: 'UPDATE_ITEM', payload: { id: updatedItem.id, quantity: newQuantity } });
        }
      } else {
        // Add new item
        const insertData = {
          cart_id: cart.id,
          product_id: productId,
          color_id: colorId || null,
          quantity,
          price_at_add: product.prince,
        };

        console.log('Inserting new item:', insertData);

        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert([insertData])
          .select(`
            *,
            product:products(*),
            color:product_colors(*)
          `)
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        console.log('New item created:', newItem);

        if (newItem) {
          dispatch({ type: 'ADD_ITEM', payload: newItem });
        }
      }

      toast.success('Producto agregado al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error al eliminar del carrito');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const cart = await getCart();
      if (!cart) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (error) {
        throw error;
      }

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Error al limpiar carrito');
    }
  };

  // Load cart on mount and when window becomes visible
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCartItems();

      // Reload cart when window becomes visible (handles tab switching)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadCartItems();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Listen for auth changes with improved handling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Cart: Auth state changed:', event, session?.user?.id);
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (event === 'SIGNED_IN' && session) {
        console.log('Cart: User signed in, reloading cart');
        // User signed in, reload cart after a short delay
        timeoutId = setTimeout(() => {
          loadCartItems();
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        console.log('Cart: User signed out, clearing cart');
        // User signed out, clear cart immediately
        dispatch({ type: 'CLEAR_CART' });
        // Then reload for anonymous session after a delay
        timeoutId = setTimeout(() => {
          loadCartItems();
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}