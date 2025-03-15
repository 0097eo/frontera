import { useContext } from "react";
import WishListContext from "../context/WishListContext";


export const useWishList = () => {
    const context = useContext(WishListContext);

    if (context === null) {
        throw new Error("useWishList must be used within a WishListProvider");
    }

    return context;
}

export default useWishList;