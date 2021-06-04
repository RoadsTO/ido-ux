import { useCallback, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '..'
import { useClearingPriceInfo2 } from '../../hooks/useCurrentClearingOrderAndVolumeCallback'
import { DerivedAuctionInfo, orderToPrice, orderToSellOrder } from '../orderPlacement/hooks'
import { AuctionIdentifier } from '../orderPlacement/reducer'
import { alterationCurrentPrice, setCurrentPrice, updateCurrentPrice } from './actions'
import { PriceStatus } from './reducer'

export function useAuctionPriceState(): AppState['auctionPrice'] {
  return useSelector<AppState, AppState['auctionPrice']>((state) => state.auctionPrice)
}

export function useAuctionPriceHandlers(): {
  onSetCurrentPrice: (price: string, priceReversed: string) => void
  onPriceAlteration: () => void
  onUpdateIfPriceChanged: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onSetCurrentPrice = useCallback(
    (price: string, priceReversed: string) => {
      dispatch(setCurrentPrice({ price, priceReversed }))
    },
    [dispatch],
  )
  const onPriceAlteration = useCallback(() => {
    dispatch(alterationCurrentPrice())
  }, [dispatch])
  const onUpdateIfPriceChanged = useCallback(() => {
    dispatch(updateCurrentPrice())
  }, [dispatch])

  return {
    onSetCurrentPrice,
    onPriceAlteration,
    onUpdateIfPriceChanged,
  }
}

export function useSetCurrentPrice(
  auctionIdentifier: AuctionIdentifier,
  derivedAuctionInfo: DerivedAuctionInfo,
  shouldLoadPrice: PriceStatus,
) {
  const { onSetCurrentPrice } = useAuctionPriceHandlers()
  const { clearingPriceInfo } = useClearingPriceInfo2(auctionIdentifier, shouldLoadPrice)

  useEffect(() => {
    if (!clearingPriceInfo || !derivedAuctionInfo || !shouldLoadPrice) return

    const clearingPriceInfoAsSellOrder = orderToSellOrder(
      clearingPriceInfo.clearingOrder,
      derivedAuctionInfo.biddingToken,
      derivedAuctionInfo.auctioningToken,
    )
    const price = orderToPrice(clearingPriceInfoAsSellOrder)?.toSignificant(5)
    const priceReversed = orderToPrice(clearingPriceInfoAsSellOrder)?.invert().toSignificant(5)
    onSetCurrentPrice(price as string, priceReversed as string)
  }, [clearingPriceInfo, derivedAuctionInfo, auctionIdentifier, shouldLoadPrice, onSetCurrentPrice])
}
