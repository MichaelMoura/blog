export function handleParseDate(value:string):Date{
    const [date] = value.split(/[+]/g)

    return new Date(date)
}