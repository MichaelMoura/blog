import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

import {FaRegCalendar} from "react-icons/fa";
import {BsPerson} from "react-icons/bs";

import {useCallback, useState} from "react"
import { handleDateFormat } from '../utils/dateFormat';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  page:number;
  total_pages:number;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({postsPagination}:HomeProps) {
  const [posts,setPosts] = useState<PostPagination>({} as PostPagination);
  const [existisNextPost,setExistisNextPost] = useState(postsPagination.page < postsPagination.total_pages );
  
  const handleLoadMorePosts = useCallback(async ()=>{   
    let newPosts:PostPagination;
    let response:PostPagination; 

    try{
    
      if(posts.results==null){
        response = await (await fetch(`http://localhost:3000/api/post-pagination?page=${postsPagination.page + 1}`)).json()  
      }else{
        response = await (await fetch(`http://localhost:3000/api/post-pagination?page=${posts.page + 1}`)).json()  
      }
    
    
    const newPost = response.results.map(post=>{
      return{
        uid:post.uid,
        first_publication_date:handleDateFormat(post.first_publication_date),
        data:{
          title:post.data.title,
          subtitle:post.data.subtitle,
          author:post.data.author
        }
      }
    })
    
    

    if(Object.keys(posts).length === 0){
      newPosts = {
        page:response.page,
        total_pages:response.total_pages,
        results: newPost
      } 
    }else{
      let previousPost = [...posts.results];

      newPosts = {
        page:response.page,
        total_pages:response.total_pages,
        results: previousPost.concat(newPost)
      } 
    }
    
  }catch(error){
    alert(error.message)
  }finally{
    setPosts(newPosts);
    setExistisNextPost(newPosts.page < newPosts.total_pages);
  }
  },[posts])

  return(
    <main className={styles.container}>
      {postsPagination.results.map(post=>(
        <Link href={`/post/${post?.uid}`} key={post?.uid}>
          <section  className={styles.post}>
              <h1>{post.data.title}</h1>
              <h6>{post.data.subtitle}</h6>
              <div className={styles.postInfos}>
                <div><FaRegCalendar size="16"/><span>{post.first_publication_date}</span></div>
                <div><BsPerson size="22"/><span>{post.data.author}</span></div>
              </div>
          </section>
        </Link>
      ))}

    
      {posts.results && posts.results.map(post=>(
        <Link href={`/post/${post?.uid}`} key={post?.uid}>
          <section className={styles.post}>
            <h1>{post.data.title}</h1>
            <h6>{post.data.subtitle}</h6>
            <div className={styles.postInfos}>
              <div><FaRegCalendar size="16"/><span>{post.first_publication_date}</span></div>
              <div><BsPerson size="22"/><span>{post.data.author}</span></div>
            </div>
          </section>
        </Link>
      ))}
      


      {existisNextPost && (
        <button type='button' key="queiso" className={styles.loadMorePosts} onClick={handleLoadMorePosts}>Carregar Mais Posts</button>
      )} 
    </main>
  )
}

export const getStaticProps:GetStaticProps = async () => {

  
  const prismic = getPrismicClient();

  const response = await prismic.get(
     {pageSize:1,
     }
  )
  
  const posts = response.results.map(post=>{
    return{
      uid:post.uid,
      first_publication_date:handleDateFormat(post.first_publication_date),
      data:{
        title:post.data.title,
        subtitle:post.data.subtitle,
        author:post.data.author
      }
    }
  })

  const postsPagination = {
    page:response.page,
    total_pages:response.total_pages,
    results:posts,
  }

  return{
    props:{
      postsPagination
    },
    revalidate: 60*60*24
  }
  
}