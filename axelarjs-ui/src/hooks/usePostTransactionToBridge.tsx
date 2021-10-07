import {useCallback, useState}             from "react";
import {
	BlockCypherResponse,
	IAssetTransferObject,
	IBlockCypherResponse,
	ITokenAddress
}                                          from "@axelar-network/axelarjs-sdk";
import {TransferAssetBridgeFacade}         from "api/TransferAssetBridgeFacade";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {
	ChainSelection,
	DESTINATION_TOKEN_KEY,
	DestinationAddress,
	SOURCE_TOKEN_KEY
}                                          from "state/ChainSelection";
import {
	IConfirmationStatus,
	NumberConfirmations,
	SourceDepositAddress
} from "state/TransactionStatus";

export default function usePostTransactionToBridge() {

	const [showTransactionStatusWindow, setShowTransactionStatusWindow] = useState(false);
	const sourceToken = useRecoilValue(ChainSelection(SOURCE_TOKEN_KEY));
	const destinationToken = useRecoilValue(ChainSelection(DESTINATION_TOKEN_KEY));
	const destinationAddress = useRecoilValue(DestinationAddress);
	const setDepositAddress = useSetRecoilState(SourceDepositAddress);
	const setNumConfirmations = useSetRecoilState(NumberConfirmations);

	const handleTransactionSubmission = useCallback(async () => {

		if (!(sourceToken?.symbol && destinationToken?.symbol && destinationAddress))
			return;

		setShowTransactionStatusWindow(true);

		const successCb: IBlockCypherResponse = (status: BlockCypherResponse): void => {

			console.log("status+++++", status);

			const confirms: IConfirmationStatus = {
				numberConfirmations: null,
				numberRequiredConfirmations: status.axelarRequiredNumConfirmations
			};

			if (status.unconfirmed_txrefs)
				confirms.numberConfirmations = null;
			else if (status?.txrefs?.length)
				confirms.numberConfirmations = status.txrefs[0].confirmations;

			setNumConfirmations(confirms);

		};

		const failCb = (data: any): void => console.log(data);

		const res: ITokenAddress = await TransferAssetBridgeFacade.transferAssets({
			sourceTokenInfo: {
				tokenSymbol: sourceToken.symbol,
				tokenAddress: null
			},
			destinationTokenInfo: {
				tokenSymbol: destinationToken.symbol,
				tokenAddress: destinationAddress
			}
		} as IAssetTransferObject, successCb, failCb);

		setDepositAddress(res);

	}, [sourceToken, destinationToken, destinationAddress, setDepositAddress, setNumConfirmations]);

	const closeResultsScreen = () => {
		setShowTransactionStatusWindow(false);
	}


	return [showTransactionStatusWindow, handleTransactionSubmission, closeResultsScreen] as const;
}