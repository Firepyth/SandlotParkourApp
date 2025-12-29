interface TableHeadingProps {
    children: React.ReactNode, 
    handleSort?: Function, 
    sort?: string, 
    direction?: string, 
    column?: string, 
    interactive?: boolean
}

export default function TableHeading ({children = '', handleSort = () => {}, sort, direction = '', column = '', interactive = true}: TableHeadingProps) {
    if (!interactive) {
        return <th>
            {children}
        </th>
    }
    return <th className="cursor-pointer" onClick={() => handleSort(column)}>
        {children}
        <span className="mx-2">{sort !== column ? '-' : direction === 'ASC' ? '⏶' : '⏷'}</span>
    </th>
}