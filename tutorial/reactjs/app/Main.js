import React, { useState, useReducer, useEffect } from "react"
import ReactDOM from "react-dom/client"
// import ReactDOM from "react-dom" //old version
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CSSTransition } from "react-transition-group"
import Axios from 'axios'
import Axiosinstance from "./AxiosInstance"

//set default url domain
// Axios.defaults.baseURL = 'http://localhost:8080' 

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

//My Componenets
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import Home from './components/Home'
import CreatePost from "./components/CreatePost"
import ViewSinglePost from "./components/ViewSinglePost"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
import Search from "./components/Search"
import Chat from "./components/Chat"

function Main() {
    const initialState ={
        loggedIn: Boolean(localStorage.getItem("complexappToken")),
        flashMessages: [],
        user: {
            token: localStorage.getItem("complexappToken"),
            username: localStorage.getItem("complexappUsername")
        },
        isSearchOpen: false,
        isChatOpen: false
    }

    //Without using Immer
    // function ourReducer(state, action){
    //     switch (action.type){
    //         case "login":
    //             return {loggedIn: true, flashMessages: state.flashMessages}
    //         case "logout":
    //             return {loggedIn: false, flashMessages: state.flashMessages}
    //         case "flashMessage":
    //             return {loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value)}
    //     }
    // }

    //Use Immer so that even if there are many state it can still be neat
    function ourReducer(draft, action){
        switch (action.type){
            case "login":
                draft.loggedIn = true
                draft.user = action.data
                return
            case "logout":
                draft.loggedIn = false
                return
            case "flashMessage":
                draft.flashMessages.push(action.value)
                return
            case "openSearch":
                draft.isSearchOpen = true
                return
            case "closeSearch":
                draft.isSearchOpen = false
                return
            case "toggleChat":
                draft.isChatOpen = !draft.isChatOpen
                return
            case "closeChat":
                draft.isChatOpen = false
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    useEffect(() => {
        if (state.loggedIn) {
            localStorage.setItem("complexappToken", state.user.token)
            localStorage.setItem("complexappUsername", state.user.username)
        }
        else{
            localStorage.removeItem("complexappToken")
            localStorage.removeItem("complexappUsername")
        }
    }, [state.loggedIn])



    //check if token has expired or not on first render
    // useEffect(() => {
    //     if(state.loggedIn){
    //         const ourRequest = Axios.CancelToken.source()

    //         async function fetchResults(){
    //             try{
    //                 const response = await Axiosinstance.get("/checkToken", {cancelToken: ourRequest.token})
    //             }
    //             catch(e){
    //                 console.log("Token expired")
    //                 removeAuthTokenCookie()
    //                 dispatch({type: "logout"})
    //                 dispatch({ type: "flashMessage", value: "Your session has expired"})
    //             }
    //         }
    //         fetchResults()
    //         return () => ourRequest.cancel()
    //     }
    // }, [])


    return(
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages} />
                    <Header />

                    <Routes>
                        <Route path="/profile/:username/*" element={<Profile />} />
                        <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
                        <Route path="/post/:id" element={<ViewSinglePost />} />
                        <Route path="/post/:id/edit" element={<EditPost />} />
                        <Route path="/create-post" element={<CreatePost />} />
                        <Route path="/about-us" element={<About />}/>
                        <Route path="/terms" element={<Terms />}/>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    
                    <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
                        <Search />
                    </CSSTransition>
                    <Chat />
                    <Footer />
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

//set up to load javascript on the fly asynchronously
if(module.hot){
    module.hot.accept()
}
