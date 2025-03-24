const { getIATACode } = require('./apiService');

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

const isValidFutureDate = (dateStr) => {
    try {
        const [day, month, year] = dateStr.split('/').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
    } catch (error) {
        console.error('Date validation error:', error);
        return false;
    }
};

const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return [
        day.padStart(2, '0'),
        month.padStart(2, '0'),
        year
    ].join('/');
};

const parseInput = async (input, lang) => {
    try {
        const normalizedInput = convertArabicNumbers(input);
        const regex = lang === "ar"
            ? /^(\S+)\s+(\S+)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/
            : /^(\S+)\s+(\S+)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/;

        const match = normalizedInput.match(regex);
        if (!match) return null;

        let [_, from, to, date] = match;
        
        // Auto-correct date format
        const correctedDate = formatDate(date);
        
        if (!isValidFutureDate(correctedDate)) {
            return { error: 'past_date' };
        }

        from = from.length === 3 ? from : await getIATACode(from);
        to = to.length === 3 ? to : await getIATACode(to);

        return from && to ? { 
            from: from.toUpperCase(), 
            to: to.toUpperCase(), 
            date: correctedDate,
            originalDate: date // Keep original for display
        } : null;
    } catch (error) {
        console.error('Error in parseInput:', error);
        return { error: 'processing_error' };
    }
};

module.exports = {
    detectLanguage: (text) => /[\u0600-\u06FF]/.test(text) ? "ar" : "en",
    convertArabicNumbers,
    isValidFutureDate,
    parseInput,
    formatDate
};