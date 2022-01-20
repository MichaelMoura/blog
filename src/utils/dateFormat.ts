export function handleDateFormat(date:string | Date):string{
    let value:string; 

    if(typeof date == "string"){
      value = Intl.DateTimeFormat("pt-br",{
        day:"2-digit",
        month:"short",
        year:"numeric",
  
      }).format(Date.parse(date))
    }else{
      value = Intl.DateTimeFormat("pt-br",{
        day:"2-digit",
        month:"short",
        year:"numeric",
  
      }).format(date)
    }
  
    return value.replace(/ de /g, " ").replace(".","");
  }