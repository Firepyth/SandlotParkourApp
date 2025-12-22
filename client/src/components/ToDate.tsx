export default function ToDate ({ date }: {date: string}) {
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

    return <>
        {month} {parseInt(date.substring(8,10))}, {year}
    </>
}