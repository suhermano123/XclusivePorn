import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import useDynamoDB from "@/hooks/UseDynamoDB";

const { putItem } = useDynamoDB('visitor_information');

const getVisitorInfoAndInsert = async (data: any) => {
  try {


    const visitorInfo = {
      id_visitor: { S: uuidv4() },
      country: { S: data.country || 'Unknown' },
      regionName: { S: data.regionName || 'Unknown' },
      city: { S: data.city || 'Unknown' },
      zip: { S: data.zip || 'Unknown' },
      lat: { N: data.lat ? data.lat.toString() : '0' },
      lon: { N: data.lon ? data.lon.toString() : '0' },
      timezone: { S: data.timezone || 'Unknown' },
      isp: { S: data.isp || 'Unknown' },
      org: { S: data.org || 'Unknown' },
      as: { S: data.as || 'Unknown' },
      ip: { S: data.query || 'Unknown' },
    };

    await putItem(visitorInfo);
    //console.log('Visitor information inserted:', visitorInfo);

  } catch (error) {
    console.error('Error fetching visitor information or inserting to DynamoDB:', error);
  }
};


export default function HomeIndex() {
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const { ip } = await response.json();

        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData?.query != '179.1.136.81')
          getVisitorInfoAndInsert(geoData)
        //console.log("Visitor IP Information:", geoData);
      } catch (error) {
        console.error("Error fetching IP information:", error);
      }
    };

    fetchIPInfo();
  }, []);

  return (
    <div>
      <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d"></meta>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />
      <>
        <Head>
          <title>Free Premium Adult Videos | Download & Share in HD</title>
          <link rel="canonical" href="https://www.xclusiveporn.org/Home" />
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
