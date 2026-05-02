import { useState, useEffect } from "react";
import AWS from "aws-sdk";

// Configure S3 client for Wasabi
const s3 = new AWS.S3({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT || "https://s3.wasabisys.com",
  region: process.env.NEXT_PUBLIC_WASABI_REGION || "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_WASABI_ACCESS_KEY || "",
  secretAccessKey: process.env.NEXT_PUBLIC_WASABI_SECRET_KEY || "",
  signatureVersion: "v4",
});

/**
 * Hook to get a signed URL for an object in Wasabi S3 and
 * provide a function to download the file directly.
 *
 * @param {string} objectKey - Name (and path) of the file in the bucket.
 * @param {number} expiresIn - URL validity time in seconds (default 900s = 15 min).
 * @returns {Object} { url, loading, error, downloadFile }
 */
const useWasabiObjectUrl = (objectKey: string, expiresIn = 900) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectKey) {
      setLoading(false);
      return;
    }

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        // Generate signed URL to access the object and force direct download
        const signedUrl = s3.getSignedUrl("getObject", {
          Bucket: "videos-play",
          Key: objectKey,
          Expires: expiresIn,
          ResponseContentDisposition: `attachment; filename=${objectKey.split("/").pop()}`,
        });
        setUrl(signedUrl);
      } catch (err) {
        setError("Error getting signed URL from Wasabi S3");
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [objectKey, expiresIn]);

  /**
   * Function to download the file directly using the signed URL.
   */
  const downloadFile = () => {
    if (!url) {
      console.error("Signed URL was not generated");
      return;
    }
    // Open the signed URL in a new tab, which triggers the download
    window.open(url, "_blank");
  };

  return { url, loading, error, downloadFile };
};

export default useWasabiObjectUrl;
