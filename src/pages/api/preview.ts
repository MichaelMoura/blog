import {NextApiRequest, NextApiResponse} from "next";
import { Client } from "@prismicio/client";
import { getPrismicClient } from "../../services/prismic";

function linkResolver(doc) {
    // Pretty URLs for known types
    if (doc.type === 'post') {
      return `/posts/${doc.uid}`
    }
  
    // Fallback for other types, in case new custom types get created
    return `/${doc.uid}`
  }

export default async function(request:NextApiRequest, response:NextApiResponse){
    const {token:ref,documentId} = request.query;

    const client = getPrismicClient();

    const url = await client.resolvePreviewURL({
        defaultURL:"/",
        previewToken:ref.toString(),
        documentID:documentId.toString(),
        linkResolver:(document)=>`/post/${document.slug}`
    })
    
    if(!url){
        return response.status(401).json({messsage:"Invalid Token"})
    }

    response.setPreviewData({ref})

    response.write(
        `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${url}" />
        <script>window.location.href = '${url}'</script>
        </head>`
    )

    response.end()
}