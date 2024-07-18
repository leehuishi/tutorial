import React, { useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import Page from "./Page"
import StateContext from "../StateContext"
import { useImmer } from 'use-immer'
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function Home(){
    const appState = useContext(StateContext)
    const [state, setState] = useImmer({
        isLoading: true,
        feed: []
    })

    useEffect(() => {
        async function fetchData() {
            try{
                //get HomeFeed
                const response = {
                    data: [
                        {
                            id: 1,
                            title: "Quick Test",
                            body: "Lorem ipsum",
                            createDate: "2020-03-18",
                            author: {
                                username: "John"
                            }
                        },
                        {
                            id: 2,
                            title: "Test Test",
                            body: "Lorem ipsum",
                            createDate: "2020-03-24",
                            author: {
                                username: "Jane"
                            }
                        }
                    ]
                }

                setState(draft => {
                    draft.isLoading = false
                    draft.feed = response.data
                })
            }
            catch(e){
                console.log("There was a problem.")
            }
        }
        fetchData()
    }, [])

    if(state.isLoading){
        return <LoadingDotsIcon />
    }

    return (
        <Page title="Your Feed">
            {state.feed.length > 0 && (
                <>
                    <h2 className="text-center mb-4">
                        The Latest From Those You Follow
                    </h2>
                    <div className="list-group">
                        {
                            state.feed.map(post => {
                                return <Post post={post} key={post.id}/>
                            })
                        }
                    </div>
                </>
            )}

            {state.feed.length == 0 && (
                <>
                    <h2 className="text-center">
                            Hello <strong>{appState.user.username}</strong>, 
                            your feed is empty.
                    </h2>
                    <p className="lead text-muted text-center">
                        Your feed displays the latest posts from the people 
                        you follow. If you don&rsquo;t have any friends to 
                        follow that&rsquo;s okay; you can use the &ldquo;
                        Search&rdquo; feature in the top menu bar to find 
                        content written by people with similar interests and 
                        then follow them.
                    </p>
                </>
            )}
        </Page>
    )
}

export default Home