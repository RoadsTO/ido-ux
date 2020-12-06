import React, { useContext, useState } from "react";
import { Text } from "rebass";
import { ThemeContext } from "styled-components";
import { ButtonError, ButtonLight } from "../../components/Button";
import { GreyCard } from "../../components/Card";
import { BottomGrouping, Wrapper } from "../swap/styleds";
import ClaimConfirmationModal from "../ClaimConfirmationModal";

import { useActiveWeb3React } from "../../hooks";
import { useClaimOrderCallback } from "../../hooks/useClaimOrderCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import {
  useDerivedClaimInfo,
  useSwapState,
  useDataFromEventLogs,
} from "../../state/orderplacement/hooks";
import { TYPE } from "../../theme";

export default function Claimer() {
  const { chainId, account } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // swap state
  const { auctionId, independentField, sellAmount, price } = useSwapState();
  const { error, sellToken, buyToken } = useDerivedClaimInfo(auctionId);

  const isValid = !error;
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirmed
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true); // waiting for user confirmation

  const sellOrderEventsForUser = useDataFromEventLogs(auctionId);
  // txn values
  const [txHash, setTxHash] = useState<string>("");

  // reset modal state when closed
  function resetModal() {
    setPendingConfirmation(true);
    setAttemptingTxn(false);
  }

  // the callback to execute the swap
  const claimOrderCallback = useClaimOrderCallback();

  function onClaimOrder() {
    setAttemptingTxn(true);
    claimOrderCallback().then((hash) => {
      setTxHash(hash);
      setPendingConfirmation(false);
    });
  }

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // text to show while loading
  const pendingText = `Claiming Funds`;

  return (
    <>
      <Wrapper id="swap-page">
        <ClaimConfirmationModal
          isOpen={showConfirm}
          onDismiss={() => {
            resetModal();
            setShowConfirm(false);
          }}
          pendingConfirmation={pendingConfirmation}
          hash={txHash}
          pendingText={pendingText}
        />
        <BottomGrouping>
          {!account ? (
            <ButtonLight onClick={toggleWalletModal}>
              Connect Wallet
            </ButtonLight>
          ) : error ? (
            <GreyCard style={{ textAlign: "center" }}>
              <TYPE.main mb="4px">{error} </TYPE.main>
            </GreyCard>
          ) : (
            <ButtonError
              onClick={() => {
                setShowConfirm(true);
                onClaimOrder();
              }}
              id="swap-button"
              disabled={!isValid}
              error={isValid}
            >
              <Text fontSize={20} fontWeight={500}>
                {error ?? `Claim Funds`}
              </Text>
            </ButtonError>
          )}
        </BottomGrouping>
      </Wrapper>
    </>
  );
}