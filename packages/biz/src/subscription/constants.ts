export enum SubscriptionStatus {
  FREE = 1,
  PRO = 2,
}

export const SubscriptionStatusTextMap: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.FREE]: "Free",
  [SubscriptionStatus.PRO]: "Pro",
};
