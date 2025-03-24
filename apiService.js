const axios = require("axios");
const { KIWI_API_KEY } = require('./config');

module.exports = {
    getIATACode: async (location) => {
        try {
            const response = await axios.get("https://api.tequila.kiwi.com/locations/query", {
                headers: { apikey: KIWI_API_KEY },
                params: { term: location, location_types: "airport", limit: 1 }
            });
            return response.data.locations[0]?.code;
        } catch (error) {
            console.error(`Error fetching IATA for ${location}:`, error);
            return null;
        }
    },

    searchFlights: async (from, to, date) => {
        try {
            const response = await axios.get("https://api.tequila.kiwi.com/v2/search", {
                headers: { apikey: KIWI_API_KEY },
                params: {
                    fly_from: from,
                    fly_to: to,
                    date_from: date,
                    date_to: date,
                    curr: "USD",
                    limit: 10,
                    sort: "price"
                }
            });
            return response.data.data;
        } catch (error) {
            console.error("Flight search error:", error);
            return [];
        }
    }
};