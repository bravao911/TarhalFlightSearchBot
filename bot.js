require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const KIWI_API_KEY = process.env.KIWI_API_KEY;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const userLanguage = {}; // Stores user's language preference

// Welcome message template
const welcomeMessage = {
    en: "Welcome to the Flight Booking Bot!\nPlease select your language:",
    ar: "مرحبًا بكم في بوت حجز تذاكر الطيران!\nالرجاء اختيار اللغة:"
};

// Language selection keyboard
const getLanguageKeyboard = (lang) => ({
    reply_markup: {
        inline_keyboard: [
            [{ 
                text: lang === 'ar' ? "الإنجليزية 🇺🇸" : "English 🇺🇸", 
                callback_data: "lang_en" 
            }],
            [{ 
                text: lang === 'ar' ? "العربية 🇸🇦" : "العربية 🇸🇦", 
                callback_data: "lang_ar" 
            }]
        ]
    }
});

// IATA code lookup function
const getIATACode = async (location) => {
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
};

// Language detection
const detectLanguage = (text) => /[\u0600-\u06FF]/.test(text) ? "ar" : "en";

// Convert Arabic numerals to English
const convertArabicNumbers = (str) => {
    const arabicToEnglishMap = {
        '٠': '0', '۰': '0',
        '١': '1', '۱': '1',
        '٢': '2', '۲': '2',
        '٣': '3', '۳': '3',
        '٤': '4', '۴': '4',
        '٥': '5', '۵': '5',
        '٦': '6', '۶': '6',
        '٧': '7', '۷': '7',
        '٨': '8', '۸': '8',
        '٩': '9', '۹': '9'
    };
    return str.replace(/[٠-٩۰-۹]/g, (d) => arabicToEnglishMap[d]);
};

// Validate date is not in the past
const isValidFutureDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
};

// Parse user input
const parseInput = async (input, lang) => {
    const normalizedInput = convertArabicNumbers(input);

    const regex = lang === "ar"
        ? /^(\S+)\s+(\S+)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/
        : /^(\S+)\s+(\S+)\s+(\d{2}\/\d{2}\/\d{4})$/;

    const match = normalizedInput.match(regex);
    if (!match) return null;

    let [_, from, to, date] = match;

    if (!isValidFutureDate(date)) {
        return { error: 'past_date' };
    }

    from = from.length === 3 ? from : await getIATACode(from);
    to = to.length === 3 ? to : await getIATACode(to);

    return from && to ? { from: from.toUpperCase(), to: to.toUpperCase(), date } : null;
};

// Flight search
const searchFlights = async (from, to, date) => {
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
};

// Format duration
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

// Create flight message with transfer info
const createFlightMessage = (flight, lang) => {
    const duration = flight.duration?.total ? formatDuration(flight.duration.total) : flight.fly_duration;
    const hasTransfers = flight.route.length > 1;
    const transferCount = hasTransfers ? flight.route.length - 1 : 0;

    let transferInfo = '';
    if (hasTransfers) {
        const transferCities = flight.route.slice(0, -1).map(leg => leg.cityTo).join(', ');
        transferInfo = lang === 'ar'
            ? `\n✈️ عدد الترانزيت: ${transferCount}\n🏙️ مدن الترانزيت: ${transferCities}`
            : `\n✈️ Transfers: ${transferCount}\n🏙️ Via: ${transferCities}`;
    }

    const base = {
        en: `✈️ *${hasTransfers ? 'Flight with Transfers' : 'Direct Flight'} Found!*\n` +
            `🛫 From: ${flight.cityFrom} (${flight.flyFrom}) → 🛬 To: ${flight.cityTo} (${flight.flyTo})` +
            transferInfo + `\n` +
            `📅 Date: ${flight.local_departure.split('T')[0]}\n` +
            `⏳ Duration: ${duration}\n` +
            `💰 Price: ${flight.price} USD\n` +
            `[🔗 Book Now](${flight.deep_link})`,

        ar: `✈️ *${hasTransfers ? 'رحلة مع ترانزيت' : 'رحلة مباشرة'}*\n` +
            `🛫 من: ${flight.cityFrom} (${flight.flyFrom}) → 🛬 إلى: ${flight.cityTo} (${flight.flyTo})` +
            transferInfo + `\n` +
            `📅 التاريخ: ${flight.local_departure.split('T')[0]}\n` +
            `⏳ المدة: ${duration}\n` +
            `💰 السعر: ${flight.price} USD\n` +
            `[🔗 احجز الآن](${flight.deep_link})`
    };

    return base[lang];
};

// Get action buttons
const getActionButtons = (lang) => ({
    reply_markup: {
        inline_keyboard: [
            [
                { 
                    text: lang === 'ar' ? "تغيير اللغة" : "Change Language", 
                    callback_data: "change_language" 
                },
                { 
                    text: lang === 'ar' ? "بحث جديد" : "New Search", 
                    callback_data: "new_search" 
                }
            ]
        ]
    }
});

// Message handler
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === "/start" || text.toLowerCase() === "restart") {
        return bot.sendMessage(
            chatId, 
            welcomeMessage[userLanguage[chatId] || 'en'], 
            getLanguageKeyboard(userLanguage[chatId] || 'en')
        );
    }

    if (!userLanguage[chatId]) {
        return bot.sendMessage(
            chatId, 
            "Please select language first / الرجاء اختيار اللغة أولاً", 
            getLanguageKeyboard()
        );
    }

    const inputLang = detectLanguage(text);
    const parsed = await parseInput(text, inputLang);

    if (!parsed) {
        const error = userLanguage[chatId] === "ar"
            ? "❌ صيغة غير صحيحة. مثال: دبي لندن 25/04/2024 أو DXB LON 25/04/2024"
            : "❌ Invalid format. Example: Dubai London 25/04/2024 or DXB LON 25/04/2024";
        return bot.sendMessage(chatId, error);
    }

    if (parsed.error === 'past_date') {
        const error = userLanguage[chatId] === "ar"
            ? "❌ التاريخ لا يمكن أن يكون في الماضي. الرجاء إدخال تاريخ مستقبلي"
            : "❌ Date cannot be in the past. Please enter a future date";
        return bot.sendMessage(chatId, error);
    }

    const { from, to, date } = parsed;
    const searchMsg = userLanguage[chatId] === "ar"
        ? `🔍 يبحث عن رحلات من ${from} إلى ${to} في ${date}...`
        : `🔍 Searching flights from ${from} to ${to} on ${date}...`;

    await bot.sendMessage(chatId, searchMsg);

    const flights = await searchFlights(from, to, date);

    if (!flights.length) {
        const noFlights = userLanguage[chatId] === "ar"
            ? "❌ لا توجد رحلات. حاول بتواريخ أو مدن أخرى"
            : "❌ No flights found. Try different dates or cities";
        return bot.sendMessage(chatId, noFlights, getActionButtons(userLanguage[chatId]));
    }

    // Sort flights by transfer count (direct flights first)
    flights.sort((a, b) => a.route.length - b.route.length);

    // Send summary
    const directCount = flights.filter(f => f.route.length === 1).length;
    const transferCount = flights.length - directCount;
    const summaryMsg = userLanguage[chatId] === "ar"
        ? `🔍 وجدنا ${flights.length} رحلة (${directCount} مباشرة، ${transferCount} مع ترانزيت)`
        : `🔍 Found ${flights.length} flights (${directCount} direct, ${transferCount} with transfers)`;
    await bot.sendMessage(chatId, summaryMsg);

    // Send flight details
    for (const flight of flights) {
        await bot.sendMessage(
            chatId, 
            createFlightMessage(flight, userLanguage[chatId]), 
            { parse_mode: "Markdown" }
        );
    }

    // Send action buttons
    await bot.sendMessage(
        chatId,
        userLanguage[chatId] === "ar" 
            ? "اختر الإجراء التالي:" 
            : "Choose your next action:",
        getActionButtons(userLanguage[chatId])
    );
});

// Callback handler
bot.on("callback_query", async (callback) => {
    const chatId = callback.message.chat.id;
    const data = callback.data;

    if (data.startsWith("lang_")) {
        userLanguage[chatId] = data.split("_")[1];
        const confirmMsg = userLanguage[chatId] === "ar"
            ? "تم اختيار العربية. اكتب البحث مثال: دبي لندن 25/04/2024"
            : "English selected. Enter search like: Dubai London 25/04/2024";
        bot.sendMessage(chatId, confirmMsg);
    } 
    else if (data === "change_language") {
        bot.sendMessage(
            chatId, 
            welcomeMessage[userLanguage[chatId] || 'en'], 
            getLanguageKeyboard(userLanguage[chatId] || 'en')
        );
    }
    else if (data === "new_search" || data === "restart") {
        const promptMsg = userLanguage[chatId] === "ar"
            ? "اكتب البحث الجديد مثال: دبي لندن 25/04/2024"
            : "Enter your new search like: Dubai London 25/04/2024";
        bot.sendMessage(chatId, promptMsg);
    }
});

console.log("🚀 Bot is operational");