// src/services/api/watchlist.service.ts
import { axiosClient } from './http/axios.client'

const BASE = '/api/v1/settings/watchlists'

export const fetchWatchlists = () => axiosClient.get(BASE)
export const createWatchlist = (data: { name: string }) => axiosClient.post(BASE, data)
export const updateWatchlist = (id: string, data: any) => axiosClient.put(`${BASE}/${id}`, data)
export const deleteWatchlist = (id: string) => axiosClient.delete(`${BASE}/${id}`)
export const addSymbol = (watchlistId: string, symbol: string) =>
    axiosClient.post(`${BASE}/${watchlistId}/symbols/${symbol}`)
export const removeSymbol = (watchlistId: string, symbol: string) =>
    axiosClient.delete(`${BASE}/${watchlistId}/symbols/${symbol}`)
