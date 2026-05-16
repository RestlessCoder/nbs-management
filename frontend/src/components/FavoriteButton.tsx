import { useCustomMutation } from "@refinedev/core";
import { useEffect, useState } from "react";
import type { FavoriteButtonProps } from "../types";

export const FavoriteButton = ({ 
    siteId, 
    initialFavorite,
    onToggled
}: FavoriteButtonProps) => {

  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  useEffect(() => {
    setIsFavorite(initialFavorite); 
  }, [initialFavorite]);

  const { mutate } = useCustomMutation();

  const toggleFavorite = () => {

    setIsFavorite((prev) => !prev);

    mutate(
      {
        url: `${import.meta.env.VITE_BACKEND_BASE_URL}/sites/favorites/toggle`,
        method: "post",
        values: { siteId },
        meta: { withCredentials: true },
      },
      { 
        onSuccess: ({ data }) => {
            setIsFavorite(data.isFavorite);
            onToggled && onToggled();
        },
        onError: (err) => {
          console.error("Error toggling favorite:", err);
        },
      }
    );
  };

  return (
     <button 
        className={`button-circle-icon button-favourite ${isFavorite ? "liked" : ""}`}
        onClick={toggleFavorite}
    >
        <i className="far fa-heart"></i>
    </button>

  );
};
