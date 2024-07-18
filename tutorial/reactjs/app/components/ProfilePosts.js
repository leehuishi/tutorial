import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"


function ProfilePosts(){
    const {username} = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPosts] = useState([])

    useEffect(() => {
        async function fetchPosts() {
            try{
                //call all post api
                //retrieve all post by user (await)
                //temp result
                const response = {
                    data: [
                        {
                            id: 1,
                            title: "Quick Test",
                            body: "Lorem ipsum",
                            createDate: "2020-03-18",
                            author: "John"
                        },
                        {
                            id: 2,
                            title: "Test Test",
                            body: "Lorem ipsum",
                            createDate: "2020-03-24",
                            author: "Jane"
                        }
                    ]
                }
                setPosts(response.data)
                setIsLoading(false)
            }
            catch(e){
                console.log("There was a problem")
            }
        }
        fetchPosts()
    }, [username])

    if(isLoading){
        return <LoadingDotsIcon />
    }

    return(
        <div className="list-group">
            {posts.map(post => {
                return <Post noAuthor={true} post={post} key={post.id} />
            })}
        </div>
    )
}

export default ProfilePosts