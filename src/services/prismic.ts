import * as prismic from "@prismicio/client"

export function getPrismicClient():prismic.Client {
  
  const getEndPoint = prismic.getEndpoint(process.env.PRISMIC_REPOSITORY_NAME);

  const client = prismic.createClient(getEndPoint, {accessToken:process.env.PRISMIC_ACCESS_TOKEN});

  return client;
}
