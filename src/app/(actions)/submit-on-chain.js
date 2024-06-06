
export async function submitOnChain(
    transactionInputs,
    walletClient,
    publicClient
  ) {
    const { contractAddress, contractAbi, contractFunctionName, transactionArgs, transactionValue } = transactionInputs
    const account = walletClient.account?.address
  
    if (!account) {
      return { status: "ERROR", error: { message: 'Unable to submit transaction' } }
    }
  
    try {
        const writeContractParams = {
            address: contractAddress,
            abi: contractAbi,
            functionName: contractFunctionName,
            args: transactionArgs,
            account: account,
            chain: publicClient.chain,
        }

        if (transactionValue) {
            writeContractParams.value = transactionValue
        }

        const hash = await walletClient.writeContract(writeContractParams)
  
        if (hash) {
            const { status } = await publicClient.waitForTransactionReceipt({ hash })
    
            if (status === 'reverted') {
            return { status: "ERROR", error: { message: 'Transaction reverted' } }
            } else {
            return { status }
            }
        } else {
            return { status: "ERROR", error: { message: 'Unable to submit transaction' } }
        }
        } catch (err) {
        console.error(`ERROR: ${err}`)
        return { status: "ERROR", error: { message: err.message } }
    }
  }