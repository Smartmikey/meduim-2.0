import { GetStaticProps } from 'next';
import React, { useState } from 'react'
import { Header } from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from "../../typings";
import PortableText from "react-portable-text";
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

interface Props {
    post: Post
}
 function Post({post}: Props) {
    
    const [submitted, setSubmitted] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>()  

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        await fetch("/api/createComment",{
            method: "POST",
            body: JSON.stringify(data)
        })
        .then(() => {
            setSubmitted(true)
        })
        .catch(err =>{ 
            console.log(err)
            setSubmitted(false)
        })
        
    }
    return (
        <main>
            <Header />

            <img 
                className='w-full h-40 object-cover'
                src={urlFor(post.mainImage).url()!} alt="post page dynamic banner" />

                <article className='max-w-3xl mx-auto p-5'>
                    <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
                    <h2 className='text-xl font-light text-gray-500 mb-2'>{post.description}</h2>
                    <div className='flex items-center space-x-2'>
                        <img className='w-10 h-10 rounded-full' src={urlFor(post.author.image).url()!} alt={`${post.author.name}'s profile picture`} />
                        <p className=' font-extralight text-sm'>Blog post by <span className='text-green-600'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
                    </div>

                    <div className='mt-10'>
                        <PortableText 
                            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID! }
                            content={post.body}
                            serializers={{
                                h1: (props: any )=> (
                                    <h1 className='text-2xl font-bold my-5' {...props}/>
                                ),
                                h2: (props:any) => (
                                    <h2 className='text-xl font-bold my-5' {...props}/>
                                ),
                                li: (props: any) => (
                                    <li className=' ml-4 list-disc' {...props}/>
                                ),
                                link: ({ href, children}: any) => (
                                    <a href={href} className="text-blue-500 underline"> {children}</a>
                                )
                            }}
                        />
                    </div>
                </article>

                <hr className='max-w-lg border-yellow-500 mx-auto border my-5' />

                {submitted ? (
                    <div className=' flex flex-col bg-yellow-500 p-10 my-10 text-white max-w-2xl mx-auto'>
                        <h3 className='text-3xl font-bold'>Thank you for submitting a comment</h3>
                        <p>Once it is approved, it will appear below</p>
                    </div>
                ): (
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 mx-auto max-w-2xl mb-10'>
                    <h3 className='text-sm text-yellow-500'>Enjoy this article?</h3>
                    <h4 className='text-3xl font-bold'>Leave a comment below!</h4>
                    <hr className='py-3 mt-2 ' />
                    <input
                        {...register("_id")}
                        type="hidden"
                        name='_id'
                        value={post._id}
                    />
                    <label className='block mb-5'>
                        <span className='text-gray-700'>Name</span>
                        <input {...register("name", {required: true})} className='shadow rounded border py-2 px-3 form-input mt-1 block ring-yellow-500 w-full outline-none focus:ring' type={"text"} placeholder="Elon Musk" />
                    </label>
                    <label className='block mb-5'>
                        <span className='text-gray-700'>Email</span>
                        <input  {...register("email", {required: true})} className='shadow rounded border py-2 px-3 form-input mt-1 block ring-yellow-500 w-full outline-none focus:ring' type={"email"} placeholder="musk@tesla.com" />
                    </label>
                    <label className='block mb-5'>
                        <span className='text-gray-700'>comment</span>
                        <textarea  {...register("comment", {required: true})} className='shadow rounded border py-2 px-3 form-textarea mt-1 block ring-yellow-500 w-full outline-none focus:ring' rows={8} placeholder="Enter your comment" />
                    </label>
                    {/* All form errors will appear here */}
                    <div className='flex flex-col p-5'>
                        {errors.name && (
                            <span className='text-red-500'>- Name field is required</span>
                        )}
                        {errors.email && (
                            <span className='text-red-500'>- Email field is required</span>
                        )}
                        {errors.comment && (
                            <span className='text-red-500'>- Comment field is required</span>
                        )}
                    </div>

                    <input type="submit" value="Submit" className='bg-yellow-500 hover:bg-yellow-400 shadow focus:shadow-outline
                     focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer'/>
                </form>
                )}

                {/* Comments */}
                <div className='flex flex-col p-10 my-10 shadow max-w-2xl mx-auto shadow-yellow-500 border space-y-2'>
                    <h3 className='text-4xl'>Comments</h3>
                    <hr />
                    {post.comments.map(comment => (
                        <div key={comment._id}>
                            {console.log(comment)
                            }
                            <p> <span className='text-yellow-500'>{comment.name}:</span> {comment.comment}</p>
                        </div>
                    ))}
                </div>

               
        </main>
    )
}

export const getStaticPaths =async () => {
    const query = `*[_type =="post"]{
        _id,
        slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post:Post) => ({
        params: {
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
            name,
            image
        },
        "comments": *[
            _type == "comment" && 
            post._ref == ^._id &&
            pproved == true
        ],
        description,
        mainImage,
        slug,
        body
    }`;

    const post = await sanityClient.fetch(query,{
        slug: params?.slug, 
    })


    if(!post){
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 60, //revalidate the page after 60s
    }
}


export default Post