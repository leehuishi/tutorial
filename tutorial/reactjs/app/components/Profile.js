import React, { useEffect, useContext, useState } from "react"
import Page from './Page'
import { useParams, NavLink, Routes, Route } from 'react-router-dom'
import StateContext from "../StateContext"
import ProfilePosts from './ProfilePosts'
import ProfileFollowers from './ProfileFollowers'
import { useImmer } from 'use-immer'

function Profile(){
    const {username} = useParams()
    const appState = useContext(StateContext)
    const [state, setState] = useImmer({
        followActionLoading: false,
        startFollowingRequestCount: 0,
        stopFollowingRequestCount: 0,
        profileData:{
            profileUsername: "...",
            isFollowing: false,
            counts: {
                postCount: "",
                followerCount: "",
                followingCount: ""
            }
        }
    })

    //================================================
    //get user profile
    useEffect(() => {
        async function fetchData() {
            try{
                //import user profile
                //put the call here
                //temp result
                const response = {
                    data:{
                        profileUsername: "Jane",
                        isFollowing: true,
                        counts: {
                            postCount: 2,
                            followerCount: 2,
                            followingCount: 0
                        }
                    }
                }
                setState(draft => {
                    draft.profileData = response.data
                })
            }
            catch(e){
                console.log("There was a problem.")
            }
        }
        fetchData()
    }, [username])


    //================================================
    //following new profile
    useEffect(() => {
        if(state.startFollowingRequestCount){
            setState(draft => {
                draft.followActionLoading = true
            })

            async function fetchData() {
                try{
                    //add follower api here
                    const response = {data:{}}

                    setState(draft => {
                        draft.profileData.isFollowing = true
                        draft.profileData.counts.followerCount++
                        draft.followActionLoading = false
                    })
                }
                catch(e){
                    console.log("There was a problem.")
                }
            }
            fetchData()
        }
    }, [state.startFollowingRequestCount])


    //================================================
    //Stop following profile
    useEffect(() => {
        if(state.stopFollowingRequestCount){
            setState(draft => {
                draft.followActionLoading = true
            })

            async function fetchData() {
                try{
                    //remove follower api here
                    const response = {data:{}}

                    setState(draft => {
                        draft.profileData.isFollowing = false
                        draft.profileData.counts.followerCount--
                        draft.followActionLoading = false
                    })
                }
                catch(e){
                    console.log("There was a problem.")
                }
            }
            fetchData()
        }
    }, [state.stopFollowingRequestCount])
    
    
    //================================================
    function startFollowing(){
        setState(draft => {
            draft.startFollowingRequestCount++
        })
    }

    function stopFollowing(){
        setState(draft => {
            draft.stopFollowingRequestCount++
        })
    }

    return(
        <Page title="Profile Screen">
            <h2>
                <img className="avatar-small" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" /> {state.profileData.profileUsername}
                {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != '...' && (
                    <button onClick={startFollowing} disable={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
                        Follow <i className="fas fa-user-plus"></i>
                    </button>
                )}
                {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != '...' && (
                    <button onClick={stopFollowing} disable={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
                        Stop Following <i className="fas fa-user-times"></i>
                    </button>
                )}
            </h2>

            <div className="profile-nav nav nav-tabs pt-2 mb-4">
                <NavLink to="" end className="nav-item nav-link">
                    Posts: {state.profileData.counts.postCount}
                </NavLink>
                
                <NavLink to="followers" className="nav-item nav-link">
                    Followers: {state.profileData.counts.followerCount}
                </NavLink>
                
                <NavLink to="following" className="nav-item nav-link">
                    Following: {state.profileData.counts.followingCount}
                </NavLink>
            </div>

            <Routes>
                <Route path="" element={<ProfilePosts />} />
                <Route path="followers" element={<ProfileFollowers />} />
                <Route path="following" element={<ProfilePosts />} />
            </Routes>
        </Page>
    )
}

export default Profile