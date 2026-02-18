export const config = {
    runtime: 'edge',
};

export const insertVisitorInfo = async (data: any) => {
    try {
        const response = await fetch('/api/visitor-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to insert visitor info');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in insertVisitorInfo (via API):', error);
        return { success: false, error };
    }
};
