const TelegramBot = require("node-telegram-bot-api");
const { TELEGRAM_BOT_TOKEN, welcomeMessage, errorMessages } = require('./config');
const { detectLanguage, parseInput } = require('./languageService');
const { searchFlights } = require('./apiService');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const userLanguage = {};

const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

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

module.exports = {
    bot,
    userLanguage,
    createFlightMessage,
    getLanguageKeyboard,
    getActionButtons,
    welcomeMessage,
    errorMessages,
    detectLanguage,
    parseInput,
    searchFlights
};