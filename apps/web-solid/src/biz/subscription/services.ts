import { RequestPayload } from "@timeless/core";

export function fetchSubscription(params?: any): RequestPayload<any> {
  return {
    url: "/api/subscription/info",
    method: "GET",
    query: params,
  };
}
export const fetchSubscriptionList = fetchSubscription;
export const fetchSubscriptionListProcess = (res: any) => res;

export function fetchSubscriptionPlans(params?: any): RequestPayload<any> {
  return {
    url: "/api/subscription/plans",
    method: "GET",
    query: params,
  };
}
export const fetchSubscriptionPlanList = fetchSubscriptionPlans;
export const fetchSubscriptionPlanListProcess = (res: any) => res;

export function createSubscriptionOrder(params?: any): RequestPayload<any> {
  return {
    url: "/api/subscription/order",
    method: "POST",
    body: params,
  };
}
export function checkSubscriptionOrderStatus(params?: any): RequestPayload<any> {
  return {
    url: "/api/subscription/order/status",
    method: "GET",
    query: params,
  };
}
export function fetchGiftCardProfile(params?: any): RequestPayload<any> {
  return {
    url: "/api/gift_card/profile",
    method: "GET",
    query: params,
  };
}
export function usingGiftCard(params?: any): RequestPayload<any> {
  return {
    url: "/api/gift_card/use",
    method: "POST",
    body: params,
  };
}
