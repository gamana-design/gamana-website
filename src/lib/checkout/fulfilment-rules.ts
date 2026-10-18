/** Pure safety gate shared with tests; only explicitly live, payable orders print. */
export function fulfilmentAction(order: {
  payment_gateway: string;
  payment_status: string;
  payment_mode: string | null;
}): "blocked" | "test" | "live" {
  const payable =
    order.payment_gateway === "Prepaid"
      ? order.payment_status === "paid"
      : order.payment_gateway === "COD" && order.payment_status === "cod";
  if (
    !payable ||
    (order.payment_mode !== "test" && order.payment_mode !== "live")
  )
    return "blocked";
  return order.payment_mode;
}
