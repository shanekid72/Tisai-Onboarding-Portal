
// Generate Access Token
async function getAccessToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", "your-client-id");
  params.append("client_secret", "your-client-secret");
  params.append("username", "your-username");
  params.append("password", "your-password");

  const response = await fetch("https://drap.digitnine.com/auth/realms/cdp/protocol/openid-connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = await response.json();
  return data.access_token;
}

// Example flow: get token, get quote, create transaction, confirm
async function runDrapFlow() {
  try {
    const token = await getAccessToken();
    console.log("Token:", token);

    const quoteData = await createQuote(token);
    console.log("Quote Response:", quoteData);

    const quoteId = quoteData.data.quote_id;
    const txnData = await createTransaction(token, quoteId);
    console.log("Transaction Response:", txnData);

    const transactionRef = txnData.data.transaction_ref_number;
    const confirmData = await confirmTransaction(token, transactionRef);
    console.log("Confirmation Response:", confirmData);
  } catch (error) {
    console.error("Error running DRAP API flow:", error);
  }
}
