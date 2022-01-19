import type { NextApiRequest, NextApiResponse } from 'next'
import { getPrismicClient } from '../../services/prismic';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method = "GET"){
    // const {page} = req.query;


    // const nextPage = Number.parseInt(page.toString());
    
    // const prismic = getPrismicClient();

    // const responsePrismic = prismic.get({
    //     page:nextPage
    // })

    res.status(200).json({ok:"ok"})
  }else{
      res.setHeader("Allow", "GET")
      res.status(405).end("Method not allowed")
  }
}