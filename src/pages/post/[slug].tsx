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
  isPreview:boolean,
  post: Post;
}

export default function Post({post, isPreview}:PostProps) {
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

    if(previewData != undefined){
      const [url] = typeof previewData === "object" ? Object.values(previewData) : null;
      ref = url
    }

    const {slug} = params;

    const prismic = getPrismicClient();

    const uid = slug.toString();

    const response = await prismic.getByUID("posts", uid, {ref:ref});

    const post = {
      first_publication_date: response.first_publication_date != null ?
      handleDateFormat(response.first_publication_date) : handleDateFormat(new Date),
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

    return{
      props:{post,isPreview:preview},
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
