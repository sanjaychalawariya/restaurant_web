import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart from localStorage on initial render
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : {};
    });

    const url = "http://localhost:4000";
    const [token, setToken] = useState("");
    const [food_list, setFood_list] = useState([]);
    const [loading, setLoading] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Load token from localStorage on component mount
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

        useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));

        // FIXED: Correct axios call with proper headers
        if(token){
            try {
                await axios.post(
                    `${url}/api/cart/add`,
                    {itemId},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => { // CHANGED: Made async
        setCartItems((prev) => {
            const currentQuantity = prev[itemId] || 0;
            if (currentQuantity <= 1) {
                // Remove the item entirely if quantity becomes 0
                const newCart = { ...prev };
                delete newCart[itemId];
                return newCart;
            }
            return {
                ...prev,
                [itemId]: currentQuantity - 1
            };
        });

        // NEW: Sync removal with backend
        if(token){
            try {
                await axios.delete(
                    `${url}/api/cart/remove`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        data: { itemId } // axios.delete uses data for payload
                    }
                );
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        }
    };


    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    };

    const clearCart = () => {
        setCartItems({});
    };

    const fetchFoodList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/food/list`);
            setFood_list(response.data.data || []);
        } catch (error) {
            console.error("Error fetching food list:", error);
            setFood_list([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoodList();
    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartItems,
        clearCart,
        url,
        token,
        setToken,
        loading
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;