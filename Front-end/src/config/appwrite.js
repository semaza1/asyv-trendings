import { Client, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1",
  )
  .setProject(
    import.meta.env.VITE_APPWRITE_PROJECT_ID || "6918672200225a60acce",
  );

export const storage = new Storage(client);
export const APPWRITE_BUCKET_ID =
  import.meta.env.VITE_APPWRITE_BUCKET_ID || "691867700026a7c5591e";

export default client;
