import { NextRequest, NextResponse } from 'next/server'

// Cache symbols
let cryptoSymbols: string[] = []
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || 'all'

        // Check cache
        const now = Date.now()
        if (cryptoSymbols.length > 0 && now - lastFetch < CACHE_DURATION) {
            return NextResponse.json({
                category,
                symbols: cryptoSymbols,
                count: cryptoSymbols.length,
                timestamp: new Date(lastFetch).toISOString(),
            })
        }

        // Fetch from market WebSocket service or external API
        // For now, return a predefined list of common crypto symbols
        cryptoSymbols = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
            'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT',
            'AVAXUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'ETCUSDT',
            'XLMUSDT', 'ALGOUSDT', 'VETUSDT', 'FILUSDT', 'NEARUSDT',
            'AAVEUSDT', 'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'CRVUSDT',
            'YFIUSDT', 'SUSHIUSDT', '1INCHUSDT', 'ENJUSDT', 'MANAUSDT',
            'SANDUSDT', 'AXSUSDT', 'SHIBUSDT', 'PEPEUSDT', 'TRXUSDT',
        ]

        lastFetch = now

        return NextResponse.json({
            category,
            symbols: cryptoSymbols,
            count: cryptoSymbols.length,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error fetching crypto symbols:', error)
        return NextResponse.json(
            { error: 'Failed to fetch crypto symbols' },
            { status: 500 }
        )
    }
}
