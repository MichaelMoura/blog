import Link from "next/link"
import style from "./header.module.scss"

export default function Header() {
  return(
    <header className={style.container} >
      <Link href="/" >
        <img src="/images/logo.svg"/>
      </Link>
    </header>
  )
}
