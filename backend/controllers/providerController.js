// backend/controllers/providerController.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// In-memory cache for providers
let providerCache = null;

const getProvidersFromFile = async () => {
    if (providerCache) {
        return providerCache;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '..', 'data', 'searchProviders.json');

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const providers = JSON.parse(data);
        providerCache = providers;
        return providers;
    } catch (error) {
        console.error("Failed to load 'searchProviders.json':", error);
        return [];
    }
};

export const getAvailableCountries = async (req, res) => {
    try {
        const providers = await getProvidersFromFile();
        const countryMap = new Map();

        // Add a default global option for providers without specific country restrictions
        countryMap.set('GLOBAL', { name: 'Global', flag: '🌍' });

        providers.forEach(provider => {
            if (provider.enabled && provider.countries && provider.countries.length > 0) {
                provider.countries.forEach(countryCode => {
                    if (!countryMap.has(countryCode)) {
                        const countryDetails = getCountryDetails(countryCode);
                        countryMap.set(countryCode, {
                            name: countryDetails.name,
                            flag: countryDetails.flag
                        });
                    }
                });
            }
        });

        const countries = Array.from(countryMap.entries()).map(([code, details]) => ({
            code,
            ...details
        }));

        res.status(200).json(countries);

    } catch (error) {
        console.error('Error fetching available countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries.' });
    }
};

// Helper to get basic country details
const getCountryDetails = (code) => {
    const details = {
        'BD': { name: 'Bangladesh', flag: '🇧🇩' },
        'US': { name: 'United States', flag: '🇺🇸' },
        'UK': { name: 'United Kingdom', flag: '🇬🇧' },
        'CA': { name: 'Canada', flag: '🇨🇦' },
        'DE': { name: 'Germany', flag: '🇩🇪' },
    };
    return details[code] || { name: code, flag: '🏳️' };
};
