import { v4 as uuidv4 } from 'uuid';

export const getVisitorId = (): string => {
    if (typeof window === 'undefined') return '';

    let visitorId = localStorage.getItem('x_visitor_id');
    if (!visitorId) {
        visitorId = uuidv4();
        localStorage.setItem('x_visitor_id', visitorId);
    }
    return visitorId;
};
