
// Create Quote
async function createQuote(token) {
  const response = await fetch("https://drap.digitnine.com/amr/ras/api/v1_0/ras/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      sending_country_code: "AE",
      sending_currency_code: "AED",
      receiving_country_code: "PK",
      receiving_currency_code: "PKR",
      sending_amount: 100,
      receiving_mode: "BANK",
      type: "SEND",
      instrument: "REMITTANCE"
    })
  });
  return await response.json();
}

// Create Transaction
async function createTransaction(token, quoteId) {
  const response = await fetch("https://drap.digitnine.com/amr/ras/api/v1_0/ras/createtransaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      type: "SEND",
      source_of_income: "SLRY",
      purpose_of_txn: "SAVG",
      instrument: "REMITTANCE",
      sender: {
        customer_number: "1000001220000001"
      },
      receiver: {
        mobile_number: "+919586741508",
        first_name: "Anija",
        last_name: "Lastname",
        nationality: "IN"
      },
      transaction: {
        quote_id: quoteId
      }
    })
  });
  return await response.json();
}

// Confirm Transaction
async function confirmTransaction(token, transactionRef) {
  const response = await fetch("https://drap.digitnine.com/amr/ras/api/v1_0/ras/confirmtransaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      transaction_ref_number: transactionRef
    })
  });
  return await response.json();
}
