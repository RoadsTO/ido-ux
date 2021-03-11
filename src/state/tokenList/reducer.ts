import { createReducer } from '@reduxjs/toolkit'
import { TokenInfo } from '@uniswap/token-lists'

import { loadTokenListFromAPI } from './actions'

export interface TokenListState {
  tokens: TokenInfo[]
}

const initialState: TokenListState = {
  tokens: [],
}

export default createReducer<TokenListState>(initialState, (builder) =>
  builder.addCase(loadTokenListFromAPI, (state: TokenListState, { payload: { tokenList } }) => {
    return {
      ...state,
      tokens: tokenList ?? [],
    }
  }),
)
