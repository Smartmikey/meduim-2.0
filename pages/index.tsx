import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { Header } from '../components/Header'
import { sanityClient,urlFor } from "../sanity";
import { Post } from '../typings';


interface Props {
  posts: [Post]
}
const Home = ({posts}: Props) => {
  console.log(posts);
  
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Meduim blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className='flex px-10 justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
        <div className='space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'> <span className='underline decoration-black decoration-4'>Meduim</span>  is a place to write, read, and connect</h1>
          <h2>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Eius quisquam, blanditiis </h2>
        </div>
        <img className='hidden md:inline-flex h-32 lg:h-full' alt='Medium logo' src='https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png' />
      </div>

      {/* Posts */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6 '>
        {posts.map(post => (
           <Link key={post._id} href={`/post/${post.slug.current}`}>
             <div className='group cursor-pointer border rounded-lg overflow-hidden'>
             <img  className='h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out ' src={urlFor(post.mainImage).url()!} />
               <div className='flex bg-white p-2 justify-between'> 
                 <div>
                   <p className='text-lg font-bold'>{post.title}</p>
                 <p className='text-xs'>{post.description}</p>
                 </div>
                <img className='h-12 w-12 rounded-full' src={urlFor(post.author.image).url()} alt={`${post.author.name}'s picture`} />
               </div>
             </div>
           </Link>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async ()=> {
  const query =`
  *[_type == "post"]{
      _id,
      title,
      slug, 
      description,
      mainImage,
      author -> {
      name,
      image
    }
  }
  `;

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    }
  }
}

export default Home
