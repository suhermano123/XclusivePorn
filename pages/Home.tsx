import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";

export default function HomeIndex() {
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />
      <>
        <Head>
          <title>Free Premium Adult Videos | Download & Share in HD</title>
          <link rel="canonical" href="https://www.xclusiveporn.net/Home" />
          <meta
            name="description"
            content="Enjoy free premium adult videos in high definition. Download and share the latest top-quality content, updated daily."
          />
          <meta property="og:title" content="Free Premium Adult Videos in HD" />
          <meta
            property="og:description"
            content="Watch and download premium adult videos for free. High-quality content with daily updates, ready to stream and share."
          />
          <meta property="og:image" content="/assets/backGround.png" />
          <meta property="og:type" content="website" />
        </Head>

        <h1></h1>
      </>
      <VideoGrid />
    </div>
  );
}
