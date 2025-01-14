// const axios = require('axios');

// class PostalCodeService {
//     constructor() {
//         this.baseUrl = 'https://api.zippopotam.us';
//     }

//     async lookup(country, postalCode) {
//         try {
//             const response = await axios.get(`${this.baseUrl}/${country}/${postalCode}`);
//             return {
//                 success: true,
//                 data: this.formatResponse(response.data)
//             };
//         } catch (error) {
//             console.error('Postal code lookup error:', error);
//             return {
//                 success: false,
//                 error: 'Invalid postal code or service unavailable'
//             };
//         }
//     }

//     formatResponse(data) {
//         return {
//             country: data.country,
//             countryCode: data['country abbreviation'],
//             places: data.places.map(place => ({
//                 city: place['place name'],
//                 state: place.state,
//                 stateCode: place['state abbreviation'],
//                 latitude: place.latitude,
//                 longitude: place.longitude
//             }))
//         };
//     }
// }

// module.exports = new PostalCodeService();