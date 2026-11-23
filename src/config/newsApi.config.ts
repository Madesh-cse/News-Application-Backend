import "dotenv/config";
import axios from "axios"

const apikey = process.env.GNEWS_API_KEY;
if(!apikey){
    throw new Error("GNEWS_API_KEY is missing from environment variables")
}
const baseURL = process.env.GNEWS_BASE_URL || "https://gnews.io/api/v4";
const newsApiClient = axios.create({
    baseURL,
    timeout:10000,
    params:{
        apikey: apikey
    },
    headers:{
        Accept: "application/json"
    }
})

export default newsApiClient;