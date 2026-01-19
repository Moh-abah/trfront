import { NextRequest, NextResponse } from 'next/server'

// Cache symbols
let stockSymbols: string[] = []
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || 'all'

        // Check cache
        const now = Date.now()
        if (stockSymbols.length > 0 && now - lastFetch < CACHE_DURATION) {
            return NextResponse.json({
                category,
                symbols: stockSymbols,
                count: stockSymbols.length,
                timestamp: new Date(lastFetch).toISOString(),
            })
        }

        // Try to fetch from external API
        try {
            const response = await fetch('http://161.97.73.254:8017/api/v1/stocks/stocks/symbols', {
                headers: {
                    'accept': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                stockSymbols = data.symbols || []
                lastFetch = now

                return NextResponse.json({
                    category,
                    symbols: stockSymbols,
                    count: stockSymbols.length,
                    timestamp: data.timestamp || new Date().toISOString(),
                })
            }
        } catch (fetchError) {
            console.error('Failed to fetch from external API, using fallback list:', fetchError)
        }

        // Fallback to predefined list
        stockSymbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'BRK.B',
            'JPM', 'JNJ', 'V', 'PG', 'MA', 'HD', 'UNH', 'BAC', 'XOM',
            'PFE', 'CSCO', 'ADBE', 'CRM', 'NFLX', 'INTC', 'KO', 'PEP',
            'T', 'DIS', 'VZ', 'WMT', 'MRK', 'ABT', 'ORCL', 'COST', 'DHR',
            'NKE', 'CVX', 'MDT', 'LLY', 'ABBV', 'ACN', 'IBM', 'WFC', 'MCD',
            'GE', 'HON', 'AVGO', 'TXN', 'UPS', 'AMD', 'NEE', 'CAT', 'LMT',
        ]

        lastFetch = now

        return NextResponse.json({
            category,
            symbols: stockSymbols,
            count: stockSymbols.length,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error fetching stock symbols:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stock symbols' },
            { status: 500 }
        )
    }
}
