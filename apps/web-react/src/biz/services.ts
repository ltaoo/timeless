export function fetchUpdatedMediaHasHistory(params: any) {
  return {
    url: '/api/history',
    method: 'GET' as const,
    data: params
  };
}

export function fetchUpdatedMediaHasHistoryProcess(res: any) {
  return [];
}
