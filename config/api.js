// Simple environment check for browser vs server 
const IS_PRODUCTION = true; // Force production mode

const API_CONFIG = {
    development: {
        baseUrl: 'http://localhost:3000/api',
        uploadUrl: 'http://localhost:3000/api/upload'
    },
    production: {
        baseUrl: 'http://localhost:3000/api',
        uploadUrl: 'http://localhost:3000/api/upload'
    }
};

// Export helpers
export const isProduction = IS_PRODUCTION;
export const API_URL = API_CONFIG[IS_PRODUCTION ? 'production' : 'development'].baseUrl;
export const UPLOAD_URL = API_CONFIG[IS_PRODUCTION ? 'production' : 'development'].uploadUrl;

const CLOUDINARY_CONFIG = {
    cloud_name: 'dffr8v8oq',
    upload_preset: 'kiznavierr-cloud',
    uploadUrl: 'https://api.cloudinary.com/v1_1/dffr8v8oq/image/upload'
};

export { CLOUDINARY_CONFIG };
