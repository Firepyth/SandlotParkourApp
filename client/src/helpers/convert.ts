export const toTime = (time: number) => {
    const h = String(Math.floor(time / 3600000)).padStart(2, '0');
    const m = String(Math.floor((time % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((time % 60000) / 1000)).padStart(2, '0');
    const ms = String(Math.floor(time % 1000)).padStart(3, '0');

    return `${h}:${m}:${s}.${ms}`;
}

export const toDate = (date: string) => {
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ]

    const year = date.substring(0, 4);
    const month = monthNames.filter((month: string, index: number) => {
        if (date.substring(5,7) === String(index + 1).padStart(2, '0')) return month;
        return false;
    })[0];
    const day = parseInt(date.substring(8,10));

    return `${month} ${day}, ${year}`;
}

export const toTitle = (name: string) => {
    return name[0].toUpperCase() + name.slice(1);
}