export const CLEAR_PENDING_REQUESTS = 'CLEAR_PENDING_REQUESTS';
export function clearPendingRequests() {
    return {
        type: CLEAR_PENDING_REQUESTS
    };
}

export const CLEAR_PENDING_REQUEST = 'CLEAR_PENDING_REQUEST';
export function clearPendingRequest(id) {
    return {
        type: CLEAR_PENDING_REQUEST,
        id
    };
}