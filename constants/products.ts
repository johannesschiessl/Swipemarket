export const PRODUCT_CATEGORIES = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Home & Garden", value: "home_garden" },
  { label: "Sports", value: "sports" },
  { label: "Books", value: "books" },
  { label: "Toys & Games", value: "toys_games" },
  { label: "Other", value: "other" },
] as const;

export const PRODUCT_CONDITIONS = [
  { label: "New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number]["value"];
