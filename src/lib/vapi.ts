import Vapi from "@vapi-ai/web"

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string)

export default vapi