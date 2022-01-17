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
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({postsPagination}:HomeProps) {

  const [posts,setPosts] = useState<PostPagination>({} as PostPagination);
  const [existisNextPost,setExistisNextPost] = useState(postsPagination.next_page != null);
  
  console.log(Object.keys(posts).length === 0);

  const handleLoadMorePosts = useCallback(async ()=>{    
    let response:PostPagination
    
    if(posts.next_page==null){
      response = await fetch(postsPagination.next_page).then(response=>response.json());    
    }else{
      response = await fetch(posts.next_page).then(response=>response.json());    
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
    
    let newPosts:PostPagination;

    if(Object.keys(posts).length === 0){
      newPosts = {
        next_page: response.next_page,
        results: newPost
      } 
    }else{
      let previousPost = posts.results.map(r=>{return r});

      newPosts = {
        next_page: response.next_page,
        results: previousPost.concat(newPost)
      } 
    }

    setPosts(newPosts);
    setExistisNextPost(newPosts.next_page != null);
  },[])

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
  
  //console.log(JSON.stringify(response,null,2));

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
    next_page:response.next_page,
    results:posts
  }

  return{
    props:{
      postsPagination
    },
    revalidate: 60*60*24
  }
  
}