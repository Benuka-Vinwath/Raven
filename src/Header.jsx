import Engineering_Logo from "..//src/images/Engineeringlogo.jpg"
import Rextro_logo from "../src/images/RextroLogo.jpg"
import Ruhuna_logo from "../src/images/Ruhunalogo.jpg"

export default function Header () {
  return(
    <header className="Header">
      <div className="Engineering_Logo">
        <img src={Engineering_Logo}/>
      </div>
      <div className="Rextro_logo">
        <img src={Rextro_logo}/>
      </div>
      <div className="Ruhuna_logo">
        <img src={Ruhuna_logo}/>
      </div>
    </header>
  )
} 