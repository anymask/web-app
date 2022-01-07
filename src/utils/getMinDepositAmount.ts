import {AssetInfo, ChainInfo} from "@axelar-network/axelarjs-sdk";
import BigNumber                from "decimal.js";
import {Nullable}               from "interface/Nullable";

export const getMinDepositAmount = (sourceAsset: Nullable<AssetInfo>, destinationChain: Nullable<ChainInfo>) => {

	if (!sourceAsset || !destinationChain)
		return null;

	const minDepAmtOnDestChain: number | undefined = destinationChain?.assets?.find(asset => asset.common_key === sourceAsset?.common_key)?.minDepositAmt;

	if (!minDepAmtOnDestChain)
		return null;

	return (new BigNumber(minDepAmtOnDestChain)).times(1.0015).toNumber();
}
