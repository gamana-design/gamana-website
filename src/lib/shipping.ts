/** India-only store policy: delivery is included in the product price, at every order value. */
export const SHIPPING_FEE = 0;
export const SHIPPING_HEADLINE = "Free shipping across India. Always.";
export const SHIPPING_DETAIL = "Included in the price. No minimum order. No extra shipping charge.";

/** Update known old display copy without mutating product records, URLs or historic orders. */
export function shippingCopy(text: string): string {
  return text
    .replace(/free shipping\s+(?:(?:across|in)\s+India\s+)?(?:on orders\s+)?(?:at or above\s+|over\s+|above\s+)?₹\s*1,?499(?:\s+and above|\+)?/gi, SHIPPING_HEADLINE.replace(/\.$/, ""))
    .replace(/shipping calculated at checkout\.?/gi, "Shipping is included in the price.");
}
