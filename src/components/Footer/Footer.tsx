import LastDraw from "../LastDraw";
import Paniere from "../Paniere";

function Footer(){
  return (
    <div className="row-start-2 row-end-3 col-span-full hidden sm:block p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
        <LastDraw />
        <Paniere />
      </div>
    </div>
  );
}

export default Footer;