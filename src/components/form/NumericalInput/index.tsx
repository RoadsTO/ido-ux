import React from 'react'

import { escapeRegExp } from '../../../utils'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

interface Props {
  hasError?: boolean
  onUserSellAmountInput: (string) => void
  value: string | number
  className?: string
}

export const NumericalInput = React.memo(function InnerInput(
  props: Props & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>,
) {
  const { className, onUserSellAmountInput, placeholder, value } = props
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserSellAmountInput(nextUserInput)
    }
  }

  return (
    <input
      autoComplete="off"
      autoCorrect="off"
      className={className}
      inputMode="decimal"
      maxLength={79}
      minLength={1}
      onChange={(event) => {
        enforcer(event.target.value.replace(/,/g, '.'))
      }}
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.0'}
      spellCheck="false"
      type="text"
      value={value}
    />
  )
})
