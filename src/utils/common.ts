const DOLLAR_TO_WON = 1_385.9;

const changeDollarToWon = (dollar: number) => Math.floor(dollar * DOLLAR_TO_WON);

export const formatNumberWithComma = (price: string | number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatWon = (amount: number) => formatNumberWithComma(changeDollarToWon(amount));

export const formatDollar = (amount: number) => formatNumberWithComma(amount);
