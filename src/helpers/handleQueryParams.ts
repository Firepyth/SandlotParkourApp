export const getPage = (page: string): number => {
    if (page !== undefined &&  isNaN(Number(page)) !== true) {
        return parseInt(page as string) > 1 ? parseInt(page as string) : 1;
    }
    return 1;
}

export const getDirection = (direction: string): string => {
    return direction?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
}

export const getSort = (sortingOptions: string[], sort: string): string | boolean => {
    if (sort !== undefined) {
        for (let i = 0; i < sortingOptions.length; i++) {
            if (sortingOptions[i] === sort) {
                return sortingOptions[i];
            }
        };
    }
    return false;
}