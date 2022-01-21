import { NextApiRequest,NextApiResponse } from "next";
import {getPrismicClient} from "../../services/prismic"

export default async function(req:NextApiRequest,res:NextApiResponse){
    const {page} = req.query;

    const prismic = getPrismicClient();

    const response = await prismic.get({
        page:Number.parseInt(page.toString()),
        pageSize:1,
    })

    console.log(response)

    res.status(200).json(response)
}