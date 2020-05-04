import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace: cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const ExistingProduct = products.find(item => item.id === product.id);

      if (ExistingProduct) {
        const productsUpdate = products.map(item => {
          if (item.id === ExistingProduct.id) {
            ExistingProduct.quantity += 1;
          }
          return item;
        });

        setProducts(productsUpdate);

        await AsyncStorage.setItem(
          '@GoMarketPlace: cart',
          JSON.stringify(productsUpdate),
        );
      } else {
        setProducts(oldProds => [...oldProds, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketPlace: cart',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsIcrement: Product[] = products.map<Product>(item => {
        if (item.id === id) {
          const updateCart: Product = {
            id: item.id,
            title: item.title,
            image_url: item.image_url,
            price: item.price,
            quantity: item.quantity + 1,
          };
          return updateCart;
        }
        return item;
      });

      setProducts(productsIcrement);

      await AsyncStorage.setItem(
        '@GoMarketPlace: cart',
        JSON.stringify(productsIcrement),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productDecremented: Product[] = products.map<Product>(item => {
        if (item.id === id) {
          const updateCart: Product = {
            id: item.id,
            title: item.title,
            image_url: item.image_url,
            price: item.price,
            quantity: item.quantity - 1,
          };
          return updateCart;
        }
        return item;
      });

      const productsUpdated = productDecremented.filter(
        product => product.quantity !== 0,
      );

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        'cart-products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
