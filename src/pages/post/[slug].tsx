import { GetStaticPaths, GetStaticProps } from 'next';

import { BsPerson } from 'react-icons/bs';
import { FaRegCalendar } from 'react-icons/fa';
import {AiOutlineClockCircle} from "react-icons/ai"
import { getPrismicClient } from '../../services/prismic';
import { handleDateFormat } from '../../utils/dateFormat';

import styles from './post.module.scss';

import {RichText, RichTextBlock} from "prismic-reactjs"
import { useRouter } from 'next/router';
import Comments from '../../components/Comments';
import { handleParseDate } from '../../utils/parseDate';
import Link from 'next/link';

interface navegatePost{
  slugUrl:string;
  title:string;
}

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: RichTextBlock[]
    }[];
  };
}

interface PostProps {
  isPreview:boolean;
  post: Post;
  navegatePost:{
    prev:navegatePost;
    next:navegatePost;
  }
  
}

export default function Post({post, isPreview, navegatePost}:PostProps) {
  const  router = useRouter()

  function handleCalculateEstimetedReadingTime(post:RichTextBlock[]):number{
    const text =  RichText.asText(post).replace(/[.,:" ?!-]/gi,"");
    const EstimetedReadingtime = text.length / 200;
 
    return Math.ceil(EstimetedReadingtime);
  }


  if(router.isFallback){
      return(
        <section className={`${styles.container} ${styles.loadWrapper}`}>
          <div className={styles.loadingIcon}></div>
          <p>Carregando</p>
        </section>
      )
  }else{

    return(
      <>
      {isPreview && (
          <div className={styles.preview}>
            <h1>Esta Tela é um Preview</h1>
            <a href="/api/exit-preview">Sair do Preview</a>
          </div>
        )}
        {}
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner do Artigo"/>
        </div>
        <section className={styles.container}>
          <div className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfos}>
                <div><FaRegCalendar size="16"/><span>{post.first_publication_date}</span></div>
                <div><BsPerson size="18"/><span>{post.data.author}</span></div>
                <div><AiOutlineClockCircle size="16"/>
                  <span>
                    {handleCalculateEstimetedReadingTime(post.data.content[0].body)} Min
                  </span>
                </div>
            </div>
          </div>
          <div className={styles.postContent}>
            <h3>{post.data.content[0].heading}</h3>
            <RichText render={post.data.content[0].body}/>
          </div>
        </section>

        <div className={styles.navegatePost}>
          {navegatePost.prev != null && (
            <Link href={`/post/${navegatePost.prev.slugUrl}`}>
              <h6>{`/post/${navegatePost.prev.slugUrl}`}</h6>
            </Link>
          )}
          
          {navegatePost.next != null && (
            <Link href={`/post/${navegatePost.next.slugUrl}`}>
              <h6>{navegatePost.next.title}</h6>
            </Link>
          )}
          
        </div>

        <Comments />

      </>
    )
  }

}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.get({
    pageSize:1
  })

  const posts = response.results.map(post=>{
    return{
      params:{
        slug:post.uid
      }
    }
  })

  return {
    paths:[],
    fallback: true
  }
};

export const getStaticProps:GetStaticProps = async ({params,preview=false,previewData}) => {
  try{
    //ref is a  string
    //verificar se e nulo
    let ref = "";

    console.log(previewData)
    if(previewData != undefined){
      const [url] = typeof previewData === "object" ? Object.values(previewData) : null;
      ref = url
    }

    const {slug} = params;

    const prismic = getPrismicClient();

    const uid = slug.toString();

    const response = await prismic.getByUID("posts", uid, {ref:ref});

    const post = {
      first_publication_date: response.first_publication_date != null ? handleDateFormat(response.first_publication_date) : handleDateFormat(new Date),
      data:{
        title:response.data.title,
        banner:response.data.banner,
        author:response.data.author,
        content:[{
            heading:response.data.content[0].heading,
            body: response.data.content[0].body
        }]
      }
    };

    const responseNextPosts = await prismic.get({
      orderings:[
        {
          field:"document.first_publication_date",
          direction: "desc"
        },
      ],
      after:response.id,

    });

    const postList = new Map<string,navegatePost>();

    if(responseNextPosts != null){
      const currentPageDate = handleParseDate(response.first_publication_date);
      
      responseNextPosts.results.forEach(post=>{
        if(postList.get("next") == null && handleParseDate(post.first_publication_date) > currentPageDate){
          postList.set("next", {slugUrl:post.uid,title:post.data.title.toString()})
        }

        if(postList.get("prev") == null && handleParseDate(post.first_publication_date) <= currentPageDate){
          postList.set("prev",{slugUrl:post.uid,title:post.data.title.toString()})
        }
      })
    }

    const navegatePost = {
      prev:postList.get("prev") != undefined ? postList.get("prev") : null,
      next:postList.get("next") != undefined ? postList.get("next") : null
    }


    return{
      props:{
        post,
        isPreview:preview,
        navegatePost
      },
      revalidate:60*60*24
    };

  }catch(error){
    if(error instanceof Error){
      console.log(error.message)
    }

    return{
      props:{},
      revalidate:60*60*24
    };
  }

  
  
};
