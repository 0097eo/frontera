import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useProducts = (page = 1, filters = {}) => {
  return useQuery({
    queryKey: ['products', page, filters],
    queryFn: async () => {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      
      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const { data } = await axios.get(`/api/products/products/?${queryParams}`);
      return data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, 
  });
};