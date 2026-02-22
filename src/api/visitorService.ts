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

export const trackVisitorAction = async (videoUrl?: string) => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const { ip } = await response.json();

        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();

        // Add date and videoUrl to the data
        const enrichedData = {
            ...geoData,
            date: new Date().toLocaleString(),
            video_downloaded: videoUrl || 'None'
        };

        // Skip specific IP if needed (as seen in Home.tsx)
        if (geoData?.query !== '179.1.136.81') {
            return await insertVisitorInfo(enrichedData);
        }
        return { success: true, skipped: true };
    } catch (error) {
        console.error("Error tracking visitor action:", error);
        return { success: false, error };
    }
};
