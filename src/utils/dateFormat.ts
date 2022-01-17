export function handleDateFormat(date:string):string{
    return Intl.DateTimeFormat("pt-br",{
      day:"2-digit",
      month:"short",
      year:"numeric",

    }).format(Date.parse(date)).replace(/ de /g, " ").replace(".","");
  }