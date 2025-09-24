window.onload = function () {
    const userName = localStorage.getItem("user_name");
    const userEmail = localStorage.getItem("user_email");
    const preferredCategories = JSON.parse(localStorage.getItem("preferred_categories"));

    if (!userName || !userEmail || !preferredCategories || preferredCategories.length === 0) {
        window.location.href = "register.html";
        return;
    }

    const sidebarUserInfoElement = document.getElementById("sidebar-user-info");
    sidebarUserInfoElement.innerHTML = `${userName}`;

    fetchNewsForPreferences(preferredCategories);

    const navbarLogo = document.getElementById("navbar-logo");
    navbarLogo.addEventListener("click", () => {
        window.location.reload();
    });

    initializeCategorySidebar(preferredCategories);
    
    // Initialize search functionality
    initializeSearch();
};

const API_KEY = window.CONFIG?.GUARDIAN_API_KEY || "test";
const baseUrl = window.CONFIG?.GUARDIAN_API_URL || "https://content.guardianapis.com/search";

// Simple cache for better performance on Vercel
const newsCache = new Map();

let currentPage = 1;
const articlesPerPage = 12;
let currentArticles = [];

async function fetchNews(query) {
    // Check cache first for better Vercel performance
    const cacheKey = query.toLowerCase();
    const cachedData = newsCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < (window.CONFIG?.CACHE_DURATION || 300000)) {
        console.log(`Using cached data for query: ${query}`);
        return cachedData.articles;
    }
    
    try {
        console.log(`Fetching real news for query: ${query}`);
        
        // Build API URL with proper parameters
        const apiUrl = `${baseUrl}?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText,byline&page-size=20&order-by=newest`;
        console.log(`API URL: ${apiUrl}`);
        
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Guardian API Response:", data);
        
        if (data.response && data.response.results && data.response.results.length > 0) {
            console.log("Real articles found:", data.response.results.length);
            console.log("First article structure:", data.response.results[0]);
            
            // Convert Guardian format to standard format
            const articles = data.response.results.map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || article.webTitle,
                url: article.webUrl,
                urlToImage: article.fields?.thumbnail || "https://via.placeholder.com/400x200/0052CC/ffffff?text=The+Guardian",
                publishedAt: article.webPublicationDate,
                source: { name: "The Guardian" },
                author: article.fields?.byline || "The Guardian"
            }));
            
            // Cache the results for better Vercel performance
            newsCache.set(cacheKey, {
                articles: articles,
                timestamp: now
            });
            
            return articles;
        } else {
            console.log("No articles found for this query");
            return [];
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        
        // If API fails, show helpful error message
        if (error.message.includes('429')) {
            displayMessage("Rate limit exceeded. Please try again later.");
        } else if (error.message.includes('403')) {
            displayMessage("API access denied. Please check your API key.");
        } else if (error.message.includes('Failed to fetch')) {
            displayMessage("Network error. Please check your internet connection.");
        } else {
            displayMessage(`Error loading news: ${error.message}`);
        }
        return [];
    }
}

async function fetchNewsForPreferences(preferredCategories) {
    try {
        let allArticles = [];
        
        // Fetch news for each preferred category
        for (const category of preferredCategories) {
            const articles = await fetchNews(category);
            allArticles = allArticles.concat(articles);
        }
        
        // Remove duplicates based on URL
        const uniqueArticles = allArticles.filter((article, index, self) =>
            index === self.findIndex((a) => a.url === article.url)
        );
        
        console.log(`Total unique articles found: ${uniqueArticles.length}`);
        
        if (uniqueArticles.length > 0) {
            bindData(uniqueArticles);
        } else {
            displayMessage("No articles found for your preferences.");
        }
    } catch (error) {
        console.error("Error fetching news for preferences:", error);
        displayMessage("Error loading your preferred news.");
    }
}

function initializeCategorySidebar(preferredCategories) {
    const sidebarCategoriesElement = document.getElementById("category-list");
    if (!sidebarCategoriesElement) {
        console.error("Sidebar categories element not found");
        return;
    }
    
    sidebarCategoriesElement.innerHTML = "";

    preferredCategories.forEach(category => {
        const categoryElement = document.createElement("li");
        categoryElement.classList.add("category-item");
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => {
            filterByCategory(category);
        });
        sidebarCategoriesElement.appendChild(categoryElement);
    });
}

function bindData(articles) {
    console.log("Binding data with articles:", articles.length);
    console.log("Sample article:", articles[0]);
    currentArticles = articles;
    displayPage(currentPage);
}

function displayPage(page) {
    console.log(`Displaying page ${page} with ${currentArticles.length} total articles`);
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    if (!cardsContainer) {
        console.error("Cards container not found");
        return;
    }
    
    if (!newsCardTemplate) {
        console.error("News card template not found");
        return;
    }

    cardsContainer.innerHTML = "";
    const start = (page - 1) * articlesPerPage;
    const end = Math.min(start + articlesPerPage, currentArticles.length);
    const articlesToDisplay = currentArticles.slice(start, end);
    
    console.log(`Displaying articles ${start} to ${end}:`, articlesToDisplay.length);

    articlesToDisplay.forEach((article, index) => {
        console.log(`Processing article ${index}:`, article.title, "Image:", article.image);
        // Don't skip articles without images, just use a placeholder
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });

    // Update pagination buttons
    const nextButton = document.getElementById("next-button");
    const previousButton = document.getElementById("previous-button");

    if (previousButton) {
        previousButton.style.display = page > 1 ? "inline-block" : "none";
        previousButton.removeEventListener("click", onPreviousButtonClick);
        previousButton.addEventListener("click", onPreviousButtonClick);
    }
    
    if (nextButton) {
        nextButton.style.display = page * articlesPerPage < currentArticles.length ? "inline-block" : "none";
        nextButton.removeEventListener("click", onNextButtonClick);
        nextButton.addEventListener("click", onNextButtonClick);
    }
}

function onNextButtonClick() {
    if (currentPage * articlesPerPage < currentArticles.length) {
        currentPage++;
        displayPage(currentPage);
    }
}

function onPreviousButtonClick() {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const sentimentScore = cardClone.querySelector("#sentiment-score");

    // NewsAPI uses 'urlToImage' property
    const imageUrl = article.urlToImage || "https://via.placeholder.com/400x200?text=No+Image";
    newsImg.src = imageUrl;
    newsImg.onerror = function() {
        this.src = "https://via.placeholder.com/400x200?text=No+Image";
    };

    newsTitle.innerHTML = article.title || "No title available";
    newsDesc.innerHTML = article.description || "No description available";

    // NewsAPI has consistent structure
    let sourceInfo = "Unknown source";
    let dateStr = "";
    
    if (article.publishedAt) {
        const date = new Date(article.publishedAt);
        dateStr = date.toLocaleString("en-US", {
            timeZone: "Asia/Jakarta",
        });
    }
    
    if (article.source && article.source.name) {
        sourceInfo = article.source.name;
    }
    
    newsSource.innerHTML = `${sourceInfo}${dateStr ? ' · ' + dateStr : ''}`;

    if (sentimentScore) {
        sentimentScore.innerText = `Sentiment: Neutral`;
        sentimentScore.style.backgroundColor = getSentimentColor("Neutral");

        if (article.title && article.description) {
            analyzeSentiment(article.title + " " + article.description).then((sentiment) => {
                sentimentScore.innerText = `Sentiment: ${sentiment}`;
                sentimentScore.style.backgroundColor = getSentimentColor(sentiment);
            });
        }
    }

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function analyzeSentiment(text) {
    return new Promise((resolve) => {
        const url = "https://api.textrazor.com";
        const apiKey = "5a71dda79b8fc83b99bceeea59ef03b18286f4601e09bbf73c261ca5";
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-textrazor-key": apiKey,
        };

        const body = `text=${encodeURIComponent(text)}&extractors=entities,topics,keywords,sentiment`;

        fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.response && data.response.sentiment && data.response.sentiment.score) {
                    const sentimentScore = data.response.sentiment.score;
                    if (sentimentScore > 0) {
                        resolve("Positive");
                    } else if (sentimentScore < 0) {
                        resolve("Negative");
                    } else {
                        resolve("Neutral");
                    }
                } else {
                    resolve("Neutral");
                }
            })
            .catch(() => resolve("Neutral"));
    });
}

function getSentimentColor(sentiment) {
    switch (sentiment) {
        case "Positive":
            return "green";
        case "Negative":
            return "red";
        default:
            return "yellow";
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
}

function filterByCategory(category) {
    currentPage = 1;
    fetchNews(category).then(articles => {
        if (articles && articles.length > 0) {
            bindData(articles);
        } else {
            displayMessage(`No articles found for ${category}.`);
        }
    });
    toggleSidebar();
    updateActiveCategory(category);
}

function updateActiveCategory(category) {
    const categoryItems = document.querySelectorAll(".category-item");
    categoryItems.forEach(item => {
        item.classList.remove("active");
    });

    const activeCategoryItem = Array.from(categoryItems).find(item => item.textContent === category);
    if (activeCategoryItem) {
        activeCategoryItem.classList.add("active");
    }
}

function initializeSearch() {
    const searchButton = document.getElementById("search-button");
    const searchText = document.getElementById("search-text");

    console.log("Search elements:", { searchButton, searchText });

    if (searchButton && searchText) {
        console.log("Adding search event listeners");
        searchButton.addEventListener("click", handleSearch);
        searchText.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSearch();
        });
    } else {
        console.error("Search elements not found", { searchButton, searchText });
    }
}

function handleSearch() {
    console.log("handleSearch called");
    const searchText = document.getElementById("search-text");
    const query = searchText.value.trim();
    console.log("Search query:", query);
    
    if (!query) {
        displayMessage("Please enter a search query.");
        return;
    }
    if (query.length < 3) {
        displayMessage("Please enter at least 3 characters.");
        return;
    }
    
    console.log("Fetching news for search query:", query);
    fetchNews(query).then(articles => {
        console.log("Search results:", articles.length, "articles");
        if (articles && articles.length > 0) {
            bindData(articles);
        } else {
            displayMessage(`No articles found for "${query}".`);
        }
    });
}

function displayMessage(message) {
    // Remove any existing message first
    const existingMessage = document.querySelector(".error-message");
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const cardsContainer = document.getElementById("cards-container");
    const messageElement = document.createElement("div");
    messageElement.classList.add("error-message");
    messageElement.style.cssText = `
        text-align: center;
        padding: 20px;
        margin: 20px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        color: #495057;
        font-size: 16px;
    `;
    messageElement.textContent = message;
    
    cardsContainer.innerHTML = "";
    cardsContainer.appendChild(messageElement);
}

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("night");
    const theme = document.body.classList.contains("night") ? "night" : "light";
    localStorage.setItem("theme", theme); 
    if (document.body.classList.contains("night")) {
        themeIcon.src = "sun.png";
    } else {
        themeIcon.src = "night-mode.png";
    }
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "night") {
    document.body.classList.add("night");
    themeIcon.src = "sun.png";
} else {
    document.body.classList.remove("night");
    themeIcon.src = "night-mode.png";
}