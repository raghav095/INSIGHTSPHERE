const CONFIG = {
    
    GUARDIAN_API_KEY: "test", 
    GUARDIAN_API_URL: "https://content.guardianapis.com/search",
    
   
    IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
   
    CACHE_DURATION: 5 * 60 * 1000, 
};


window.CONFIG = CONFIG;