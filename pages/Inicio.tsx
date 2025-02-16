import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";


export default function HomeIndex() {
  
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#E91E63" }} />
      <NavMenu sx={{ backgroundColor: "#E91E63" }} />
      <VideoGrid />
    </div>
  );
}
