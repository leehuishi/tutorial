import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"


function ProfileFollowers(){
    const {username} = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPosts] = useState([])

    useEffect(() => {
        async function fetchPosts() {
            try{
                //the list of follower for that profile
                const response = {
                    data: [
                        {
                            username: "Brad",
                        },
                        {
                            username: "John"
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
            {posts.map((follower, index) => {
                return (
                    <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" />
                        {follower.username}
                    </Link>
                )
            })}
        </div>
    )
}

export default ProfileFollowers