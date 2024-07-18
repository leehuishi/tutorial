import React, { useEffect, useState, useContext } from "react"
import Page from './Page'
import {useParams, Link, useNavigate } from 'react-router-dom'
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
import {Tooltip as ReactTooltip} from 'react-tooltip'
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(){
    const navigate = useNavigate()
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const {id} = useParams() //get the particular post id
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState()

    useEffect(() => {
        //cancel midway
        // const outRequest = Axios.CancelToken.source()

        async function fetchPost() {
            try{
                //call specific post api
                //retrieve post details post id (await)
                //temp result
                //sample Axios call with cancel midway
                //const response = await Axios.get(`/post/${id}`, {cancelToken: ourRequest.token})
                const response = {
                    data: 
                        {
                            id: id,
                            title: "Test Test",
                            body: "Lorem ipsum **bold** *italic*",
                            createDate: "2020-03-24",
                            author: {
                                username: "Jane"
                            }
                        }
                }
                setPost(response.data)
                setIsLoading(false)
            }
            catch(e){
                console.log("There was a problem")
            }
        }
        fetchPost()
        // return () => {
        //     //clean up function (after function is unmount)
        //     //cancel midway 3
        //     ourRequest.cancel()
        // }
    }, [id])

    if(!isLoading && !post){
        return <NotFound />
    }

    if(isLoading){
        return (
            <Page title="...">
                <LoadingDotsIcon />
            </Page>
        )
    }

    const date = new Date(post.createDate)
    const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

    function isOwner(){
        if(appState.loggedIn){
            return appState.user.username == post.author.username
        }
        return false
    }

    async function deleteHandler() {
        const areYouSure = window.confirm("Confirm Delete?")
        if (areYouSure){
            //axios delete post
            try {
                //run delete post api here
                //const response = await Axios.delete(`/post/${id}`, {data:.....})
                const response = {
                    data: "success"
                }

                if(response.data == "success"){
                    //1. display flash message
                    appDispatch({type:"flashMessage", value: "Post was successfully deleted."})

                    //2. redirect back to the current user's profile
                    navigate(`/profile/${appState.user.username}`)
                }
            }
            catch(e){
                console.log("There was a problem.")
            }
        }
    }
    return (
        <Page title={post.title}>
            <div className="d-flex justify-content-between">
                <h2>{post.title}</h2>
                {isOwner() && (
                    <span className="pt-2">
                        <Link to={`/post/${post.id}/edit`} data-tooltip-content="Edit" data-tooltip-id="edit" className="text-primary mr-2">
                            <i className="fas fa-edit"></i>
                        </Link>
                        <ReactTooltip id="edit" className="custom-tooltip" />
                        
                        {" "}
                        
                        <a onClick={deleteHandler} data-tooltip-content="Delete" data-tooltip-id="delete" className="delete-post-button text-danger">
                            <i className="fas fa-trash"></i>
                        </a>
                        <ReactTooltip id="delete" className="custom-tooltip" />
                    </span>
                )}
                
            </div>

            <p className="text-muted small mb-4">
                <Link to={`/profile/${post.author.username}`}>
                <img className="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" />
                </Link>
                Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
            </p>

            <div className="body-content">
                <ReactMarkdown children={post.body}/>
            </div>
        </Page>
    )
}

export default ViewSinglePost