// Source - https://stackoverflow.com/a
// Posted by tetthys, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-18, License - CC BY-SA 4.0

// Further modifications made by myself to accomodate my uses

const json = (param: any): any => {
    return JSON.parse(
        JSON.stringify(
            param,
            (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
        )
    );
};

export default json;