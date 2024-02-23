//API call to get the stock data
export async function fetchStockData(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/time_series?apikey=adc7d6ddaadc405683b7a833edd5abbc&interval=1min&symbol=" +
      ticker +
      "&dp=2&" +
      "start_date=2024-01-18 14:07:00&format=JSON&outputsize=1",
  );
  const data = await res.json();
  const finalPrice = data.values[0].close;
  //console.log("META", data.meta.symbol);
  //console.log("VALUES", data.values[0].datetime);
  // console.log("META", data.meta);
  // console.log("VALUES", data.values[0]);
  return data;
}

export async function fetchLogo(ticker: string) {
  const res = await fetch(
    "https://api.twelvedata.com/logo?symbol=" +
      ticker +
      "&apikey=adc7d6ddaadc405683b7a833edd5abbc",
  );
  const logoLink = await res.json();
  return logoLink;
}
