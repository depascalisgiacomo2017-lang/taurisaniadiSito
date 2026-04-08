function formatDateIT(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

function formatTimeIT(timeString) {
    if (!timeString) return 'N/A';

    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }

    return timeString;
}

function formatDateTimeIT(datetimeString) {
    if (!datetimeString) return 'N/A';
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function parseDateIT(dateString) {
    if (!dateString) return null;

    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateString;
}

window.formatDateIT = formatDateIT;
window.formatTimeIT = formatTimeIT;
window.formatDateTimeIT = formatDateTimeIT;
window.parseDateIT = parseDateIT;
